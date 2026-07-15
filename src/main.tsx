import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App, { AdminRoutes } from './App'
import './index.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        {AdminRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          >
            {route.children?.map((child) => (
              <Route
                key={child.path}
                path={child.path}
                element={child.element}
              />
            ))}
          </Route>
        ))}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
