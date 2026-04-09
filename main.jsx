import React, { useState, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import Homepage from './homepage.jsx'

const CivilizationMortality = lazy(() => import('./civilization-mortality.jsx'))
const ConsciousnessTransit = lazy(() => import('./consciousness-transit.jsx'))
const PiMirror = lazy(() => import('./pi-mirror.jsx'))
const ProteinArchitecture = lazy(() => import('./protein-architecture.jsx'))
const CmbFont = lazy(() => import('./cmb-font.jsx'))

const ROUTES = {
  'civilization-mortality': CivilizationMortality,
  'consciousness-transit': ConsciousnessTransit,
  'pi-mirror': PiMirror,
  'protein-architecture': ProteinArchitecture,
  'cmb-font': CmbFont,
}

// old key -> new route (homepage.jsx uses short keys)
const KEY_TO_ROUTE = {
  civilization: 'civilization-mortality',
  consciousness: 'consciousness-transit',
  pi: 'pi-mirror',
  protein: 'protein-architecture',
  cmb: 'cmb-font',
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return ROUTES[hash] ? hash : null
}

function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onHash = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (key) => {
    const r = KEY_TO_ROUTE[key] || key
    window.location.hash = `/${r}`
  }

  const goHome = () => {
    window.location.hash = ''
    setRoute(null)
  }

  if (!route) {
    return <Homepage onEnterProject={navigate} />
  }

  const ProjectComponent = ROUTES[route]

  return (
    <Suspense fallback={
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#06060a', color: '#525252',
        fontFamily: "'Courier New', monospace",
        fontSize: '12px', letterSpacing: '3px',
      }}>
        LOADING...
      </div>
    }>
      <ProjectComponent onBack={goHome} />
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(<App />)
