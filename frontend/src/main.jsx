import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        className: 'dark:bg-slate-800 dark:text-slate-100',
      }}
    />
  </React.StrictMode>,
)
