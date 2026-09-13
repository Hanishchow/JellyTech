import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

/* A note for anyone who opens the console. Not in the page, because it is not
   the page's business; here, because this is where the people who go looking
   will find it. */
console.log(
  '%c✦%c  Design lead: Sameeksha.\n' +
    '   The jellyfish was hers first. The rest of this followed from it.',
  'color:#c77dff;font-size:16px',
  'color:#9d4edd;font-family:ui-monospace,monospace;line-height:1.6'
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
