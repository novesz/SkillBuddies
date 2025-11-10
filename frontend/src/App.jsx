import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import RegistPage from './pages/RegistPage'
import Profile from './pages/Profile'
import AboutPage from './pages/AboutPage'
import SupportPage from './pages/SupportPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/resetpass" element={<ResetPasswordPage />} />
      </Routes>
    </>
  )
}

export default App
