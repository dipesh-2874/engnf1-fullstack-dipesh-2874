import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getTicket, getTicketEvents, importTickets, listTickets, updateTicket } from '../api/ticketApi.js'
import { getSession } from '../context/authSession.js'
import { ticketStatsKey } from './useStats.js'

const listKey = ['tickets', 'list']
const detailKey = (id) => ['tickets', 'detail', id]
const eventsKey = (id) => ['tickets', 'events', id]

export function useTickets(filters, page) {
  const params = { ...filters, page, limit: 10 }

  return useQuery({
    queryKey: [...listKey, params],
    queryFn: ({ signal }) => listTickets(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useImportTickets() {
  const client = useQueryClient()

  return useMutation({
    mutationFn: importTickets,
    networkMode: 'always',
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: ['tickets'] }),
      client.invalidateQueries({ queryKey: ticketStatsKey }),
    ]),
  })
}

export function useTicket(id) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: ({ signal }) => getTicket(id, signal),
    enabled: Boolean(id),
  })
}

export function useTicketEvents(id) {
  return useQuery({
    queryKey: eventsKey(id),
    queryFn: ({ signal }) => getTicketEvents(id, signal),
    enabled: Boolean(id),
  })
}

function mapTicketRow(data, id, update) {
  if (!data?.tickets.some((ticket) => ticket.id === id)) return data
  return { ...data, tickets: data.tickets.map((ticket) => ticket.id === id ? update(ticket) : ticket) }
}

function applyOptimisticChange(ticket, changes) {
  const categoryChanged = changes.category !== undefined && changes.category !== ticket.category
  const movedFromOpen = ticket.status === 'OPEN' && changes.status !== undefined && changes.status !== 'OPEN'
  return {
    ...ticket,
    ...changes,
    assignee: changes.assigneeId === undefined ? ticket.assignee : null,
    isHumanOverride: ticket.isHumanOverride || categoryChanged,
    isReviewed: ticket.isReviewed || categoryChanged || movedFromOpen,
  }
}

export function useUpdateTicket(id) {
  const client = useQueryClient()
  const detail = detailKey(id)

  return useMutation({
    mutationKey: ['tickets', 'update', id],
    mutationFn: (changes) => updateTicket(id, changes),
    networkMode: 'always',
    async onMutate(changes) {
      const sessionVersion = getSession().version
      await Promise.all([
        client.cancelQueries({ queryKey: detail }),
        client.cancelQueries({ queryKey: listKey }),
      ])
      if (sessionVersion !== getSession().version) throw new Error('The session changed before the ticket could be updated.')

      const previousDetail = client.getQueryData(detail)
      const previousRows = client.getQueriesData({ queryKey: listKey }).flatMap(([key, page]) => {
        const row = page?.tickets.find((ticket) => ticket.id === id)
        return row ? [[key, row]] : []
      })
      const applyChange = (ticket) => applyOptimisticChange(ticket, changes)
      client.setQueryData(detail, (ticket) => ticket && applyChange(ticket))
      client.setQueriesData({ queryKey: listKey }, (page) => mapTicketRow(page, id, applyChange))
      return { previousDetail, previousRows, sessionVersion }
    },
    onError(_error, _changes, snapshot) {
      if (!snapshot || snapshot.sessionVersion !== getSession().version) return
      client.setQueryData(detail, snapshot.previousDetail)
      for (const [key, row] of snapshot.previousRows) {
        client.setQueryData(key, (page) => mapTicketRow(page, id, () => row))
      }
      toast.error('Ticket changes rolled back.')
    },
    onSuccess(saved, _changes, snapshot) {
      if (snapshot.sessionVersion !== getSession().version) return
      const previous = snapshot.previousDetail
      const resolvedAssignee = saved.assignee ?? (saved.assigneeId === previous?.assigneeId ? previous?.assignee : null)
      client.setQueryData(detail, { ...saved, assignee: resolvedAssignee ?? null })
      client.setQueriesData({ queryKey: listKey }, (page) => mapTicketRow(page, id, () => saved))
      return client.invalidateQueries({ queryKey: eventsKey(id) })
    },
    onSettled(_saved, error, _changes, snapshot) {
      if (!snapshot || snapshot.sessionVersion !== getSession().version) return
      const queries = [listKey, detail, ticketStatsKey]
      if (error) queries.push(eventsKey(id))
      return Promise.all(queries.map((queryKey) => client.invalidateQueries({ queryKey })))
    },
  })
}
