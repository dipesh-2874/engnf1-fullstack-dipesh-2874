import { CircleAlert } from 'lucide-react'
import Button from './Button.jsx'
import EmptyState from './EmptyState.jsx'

export default function ErrorState({ title = 'Something went wrong', description, onRetry, retrying = false }) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={CircleAlert}
      role="alert"
      action={onRetry && (
        <Button variant="secondary" onClick={onRetry} disabled={retrying}>
          {retrying ? 'Trying again…' : 'Try again'}
        </Button>
      )}
    />
  )
}
