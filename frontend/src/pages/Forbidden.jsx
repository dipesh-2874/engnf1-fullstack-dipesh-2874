import { Link } from 'react-router-dom'
import Button from '../components/common/Button.jsx'

export default function Forbidden() {
  return (
    <header className="dashboard-page-heading">
      <h1>Access denied</h1>
      <p>This page requires an administrator account.</p>
      <Button as={Link} to="/" replace>Back to workspace</Button>
    </header>
  )
}
