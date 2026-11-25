import { LoaderCircle } from 'lucide-react'

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="ui-loader" role="status">
      <LoaderCircle size={20} aria-hidden="true" />
      {label}
    </div>
  )
}
