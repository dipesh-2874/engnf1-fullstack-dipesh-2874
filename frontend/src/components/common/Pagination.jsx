import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button.jsx'

export default function Pagination({ page, totalPages, onPageChange, disabled = false }) {
  if (totalPages <= 1) return null

  return (
    <nav className="ui-pagination" aria-label="Pagination">
      <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1}>
        <ChevronLeft size={16} aria-hidden="true" /> Previous
      </Button>
      <span aria-live="polite">Page {page} of {totalPages}</span>
      <Button variant="secondary" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages}>
        Next <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </nav>
  )
}
