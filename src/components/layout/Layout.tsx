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
    <div className={`flex flex-col ${isChatPage ? 'h-dvh min-h-0 overflow-hidden' : 'min-h-screen'}`}>
      <ScrollToHash />
      <Navbar />
      <main key={pathname} className={`page-enter min-w-0 flex-1 ${isChatPage ? 'flex min-h-0 overflow-hidden' : ''}`}>
        <Outlet />
      </main>
      {!isChatPage && <Footer />}
      <NewUserTourModal />
      <FloatingMealieBubble />
    </div>
  )
}

