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
import GroupEditor from './pages/GroupEditor'
import { useEffect } from 'react'
import axios from 'axios'
import ChatPage from './pages/ChatPage'
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(false);
  useEffect(() => {
      axios.get("http://localhost:3001/auth/status", { withCredentials: true })
        .then((response) => {
          setIsLoggedIn(response.data.loggedIn);
          console.log(response.data.loggedIn);
          console.log(response.data);
          if(response.data.loggedIn){
            setUserId(response.data.userId);
            console.log(response.data.userId);
          }
          

        })
        .catch((error) => {
          console.error("Hiba a bejelentkezési állapot lekérésekor:", error);
        });
      
    }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={<LoginPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/register" element={<RegistPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/about" element={<AboutPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/support" element={<SupportPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/resetpass" element={<ResetPasswordPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/groupeditor" element={<GroupEditor isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/chat" element={<ChatPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>} />
      </Routes>
    </>
  )
}

export default App
