import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    {/*  AuthProvider Hace que toda la aplicación tenga acceso a:
        -isLogged
        -login()
        -logout()
 */}
    <App />
    </AuthProvider>
  </StrictMode>,
)
