import { ArrowRight, Boxes, DoorOpen, FlaskConical, UsersRound, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RESOURCE_TYPES } from '../../utils/constants.js'
import Button from '../common/Button.jsx'

const resourceIcons = { ROOM: DoorOpen, LAB: FlaskConical, EQUIPMENT: Wrench }

export default function ResourceCard({ resource }) {
  const Icon = resourceIcons[resource.type] ?? Boxes

  return (
    <li className="resource-card scheduling-surface">
      <div className="resource-card-meta">
        <span className="resource-icon"><Icon size={22} aria-hidden="true" /></span>
        <span className="ui-badge ui-badge--neutral">{RESOURCE_TYPES[resource.type] ?? resource.type}</span>
      </div>
      <h2>{resource.name}</h2>
      <p className="scheduling-capacity"><UsersRound size={16} aria-hidden="true" /> Capacity {resource.capacity}</p>
      {resource.description && <p className="scheduling-muted">{resource.description}</p>}
      <Button as={Link} to={`/resources/${encodeURIComponent(resource.id)}`} variant="secondary" aria-label={`View availability for ${resource.name}`}>
        View availability <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </li>
  )
}
