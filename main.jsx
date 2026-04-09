import React, { useState, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import Homepage from './homepage.jsx'

const CivilizationMortality = lazy(() => import('./civilization-mortality.jsx'))
const ConsciousnessTransit = lazy(() => import('./consciousness-transit.jsx'))
const PiMirror = lazy(() => import('./pi-mirror.jsx'))
const ProteinArchitecture = lazy(() => import('./protein-architecture.jsx'))
const CmbFont = lazy(() => import('./cmb-font.jsx'))

const projectMap = {
  civilization: CivilizationMortality,
  consciousness: ConsciousnessTransit,
  pi: PiMirror,
  protein: ProteinArchitecture,
  cmb: CmbFont,
}

function App() {
  const [activeProject, setActiveProject] = useState(null)

  if (!activeProject) {
    return <Homepage onEnterProject={setActiveProject} />
  }

  const ProjectComponent = projectMap[activeProject]

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
      <ProjectComponent onBack={() => setActiveProject(null)} />
    </Suspense>
  )
}

createRoot(document.getElementById('root')).render(<App />)
