import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToHash from './ScrollToHash'
import NewUserTourModal from '../onboarding/NewUserTourModal'
import FloatingMealieBubble from '../ask-mealie/FloatingMealieBubble'

export default function Layout() {
  const { pathname } = useLocation()
  const isChatPage = pathname === '/ask-mealie'

  return (
    <div className={`flex min-h-screen flex-col ${isChatPage ? 'h-screen overflow-hidden' : ''}`}>
      <ScrollToHash />
      <Navbar />
      <main key={pathname} className={`page-enter flex-1 ${isChatPage ? 'flex overflow-hidden' : ''}`}>
        <Outlet />
      </main>
      {!isChatPage && <Footer />}
      <NewUserTourModal />
      <FloatingMealieBubble />
    </div>
  )
}

