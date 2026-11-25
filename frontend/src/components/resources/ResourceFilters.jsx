import { Search } from 'lucide-react'
import { RESOURCE_TYPES } from '../../utils/constants.js'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import Select from '../common/Select.jsx'

export default function ResourceFilters({ search, type, capacity, capacityError, onSearch, onType, onCapacity, onClear }) {
  return (
    <section className="scheduling-filters scheduling-surface" aria-label="Resource filters">
      <div className="scheduling-search">
        <Input label="Search resources" type="search" maxLength={100} placeholder="Search by resource name" value={search} onChange={(event) => onSearch(event.target.value)} />
        <Search size={17} aria-hidden="true" />
      </div>
      <Select label="Resource type" value={type} onChange={(event) => onType(event.target.value)}>
        <option value="">All types</option>
        {Object.entries(RESOURCE_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </Select>
      <Input
        label="Minimum capacity"
        type="number"
        min={1}
        max={500}
        step={1}
        placeholder="Any capacity"
        value={capacity}
        error={capacityError}
        onChange={(event) => onCapacity(event.target.value)}
      />
      <Button variant="ghost" className="scheduling-filter-reset" disabled={!search && !type && !capacity} onClick={onClear}>Clear filters</Button>
    </section>
  )
}
