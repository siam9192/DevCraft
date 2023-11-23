import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './Router/Router.jsx'
import AuthProvider from './Provider/AuthProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
 <AuthProvider>
  <RouterProvider router={router}>
   <React.StrictMode>
   
  </React.StrictMode>
 </RouterProvider>
 </AuthProvider>
)
