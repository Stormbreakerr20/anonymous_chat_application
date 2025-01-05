import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';


createRoot(document.getElementById('root')).render(
  //<StrictMode>
  <GoogleOAuthProvider clientId="857779810805-sbojmllvthbp03kjeuanbjn0a0neugfq.apps.googleusercontent.com">
  <>
  <App />
  <Toaster closeButton />
  </>
  </GoogleOAuthProvider>
)
