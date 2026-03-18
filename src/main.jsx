import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import BronxBrillianceLive from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BronxBrillianceLive />
  </StrictMode>,
)
