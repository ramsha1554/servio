import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import { SocketProvider } from './context/SocketContext.jsx'

import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <SocketProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </SocketProvider>
    </Provider>
  </BrowserRouter>

)
