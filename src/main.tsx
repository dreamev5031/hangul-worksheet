import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import PracticeViewportDiagnostics from './components/PracticeViewportDiagnostics'
import './styles.css'
import './practice.css'
import './practice-landscape.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <PracticeViewportDiagnostics />
  </StrictMode>,
)
