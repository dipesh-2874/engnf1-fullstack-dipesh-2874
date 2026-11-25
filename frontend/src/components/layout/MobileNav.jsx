import { useEffect } from 'react'
import Modal from '../common/Modal.jsx'
import Sidebar from './Sidebar.jsx'

export default function MobileNav({ id, open, onClose, user }) {
  useEffect(() => {
    if (!open) return

    const tablet = window.matchMedia('(min-width: 768px)')
    const closeOnTablet = ({ matches }) => {
      if (matches) onClose()
    }

    tablet.addEventListener('change', closeOnTablet)
    window.addEventListener('popstate', onClose)
    return () => {
      tablet.removeEventListener('change', closeOnTablet)
      window.removeEventListener('popstate', onClose)
    }
  }, [open, onClose])

  return (
    <Modal id={id} open={open} onClose={onClose} title="TriageSync" className="dashboard-drawer">
      <Sidebar user={user} showBrand={false} onNavigate={onClose} />
    </Modal>
  )
}
