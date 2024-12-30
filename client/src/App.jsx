import React from 'react'
import { BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import Chat from './pages/chat'
import Profile from './pages/profile'
import Auth from './pages/auth'


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path= "/profile" element={<Profile />}/>
        <Route path= "/chat" element={<Chat />}/>
        <Route path= "/auth" element={<Auth />}/>
        <Route path = "*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App