import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToHash from './ScrollToHash'

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToHash />
      <Navbar />
      <main key={pathname} className="page-enter flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
