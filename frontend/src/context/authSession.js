import { queryClient } from '../utils/queryClient.js'

const storageKey = 'triagesync.token'
const listeners = new Set()

function readToken() {
  try {
    return window.sessionStorage.getItem(storageKey)
  } catch {
    return null
  }
}

let session = { token: readToken(), version: 0, expired: false }

export function getSession() {
  return session
}

export function subscribeToSession(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function updateSession(token, expired) {
  session = { token, expired, version: session.version + 1 }

  try {
    if (token) {
      window.sessionStorage.setItem(storageKey, token)
    } else {
      window.sessionStorage.removeItem(storageKey)
    }
  } catch {
    // The session can still be used in memory if browser storage is unavailable.
  }

  queryClient.clear()
  listeners.forEach((listener) => listener())
}

export function startSession(token) {
  updateSession(token, false)
}

export function endSession({ expired = false } = {}) {
  updateSession(null, expired)
}
