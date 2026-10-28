import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProtectedRoute from './ProtectedRoute'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import MealTrackerPage from '../pages/MealTrackerPage'
import FoodLibraryPage from '../pages/FoodLibraryPage'
import FoodScannerPage from '../pages/FoodScannerPage'
import PetWellnessPage from '../pages/PetWellnessPage'
import AskMealiePage from '../pages/AskMealiePage'
import NotFoundPage from '../pages/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/meal-tracker" element={<MealTrackerPage />} />
          <Route path="/food-library" element={<FoodLibraryPage />} />
          <Route path="/food-scanner" element={<FoodScannerPage />} />
          <Route path="/pet-wellness" element={<PetWellnessPage />} />
          <Route path="/ask-mealie" element={<AskMealiePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}