import AppRoutes from './routes/AppRoutes'
import { TooltipProvider } from './components/ui/tooltip'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AppRoutes />
      </TooltipProvider>
    </ThemeProvider>
  )
}
