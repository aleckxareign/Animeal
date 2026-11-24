import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import ProtectedRoute from './ProtectedRoute'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import MealTrackerPage from '../pages/MealTrackerPage'
import FoodLibraryPage from '../pages/FoodLibraryPage'
import FoodScannerPage from '../pages/FoodScannerPage'
import PetWellnessPage from '../pages/PetWellnessPage'
import AskMealiePage from '../pages/AskMealiePage'
import CareSchedulePage from '../pages/CareSchedulePage'
import HouseholdPage from '../pages/HouseholdPage'
import NotFoundPage from '../pages/NotFoundPage'

export default function AppRoutes() {
  const { isLoggedIn, loading } = useAuth()

  return (
    <Routes>
      {/* ── Standalone Login / Register Screen (No header and footer) ── */}
      <Route
        path="/login"
        element={
          loading ? (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="size-10 rounded-full border-4 border-brand-sage/20 border-t-brand-sage animate-spin" />
            </div>
          ) : isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* ── Main Application Shell Layout (With Navbar & Footer) ── */}
      <Route element={<Layout />}>
        {/*
          Landing Page of the website:
          - If unauthenticated: defaults to the Login Page (/login)
          - After login: opens the Home page (HomePage)
        */}
        <Route
          path="/"
          element={
            loading ? (
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="size-10 rounded-full border-4 border-brand-sage/20 border-t-brand-sage animate-spin" />
              </div>
            ) : isLoggedIn ? (
              <HomePage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/welcome" element={<HomePage />} />

        {/* Protected Application Modules */}
        <Route element={<ProtectedRoute />}>
          <Route path="/meal-tracker" element={<MealTrackerPage />} />
          <Route path="/food-library" element={<FoodLibraryPage />} />
          <Route path="/food-scanner" element={<FoodScannerPage />} />
          <Route path="/pet-wellness" element={<PetWellnessPage />} />
          <Route path="/care-schedule" element={<CareSchedulePage />} />
          <Route path="/household" element={<HouseholdPage />} />
          <Route path="/ask-mealie" element={<AskMealiePage />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
