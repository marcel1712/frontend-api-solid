import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/RequireAuth'
import { AuthProvider } from '@/lib/auth'
import { Home } from '@/pages/Home'
import { NewPet } from '@/pages/NewPet'
import { NotFound } from '@/pages/NotFound'
import { OrgDashboard } from '@/pages/OrgDashboard'
import { OrgLogin } from '@/pages/OrgLogin'
import { OrgSignup } from '@/pages/OrgSignup'
import { Pets } from '@/pages/Pets'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/ong" element={<OrgSignup />} />
          <Route path="/ong/entrar" element={<OrgLogin />} />
          <Route
            path="/ong/painel"
            element={
              <RequireAuth>
                <OrgDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/ong/painel/novo-pet"
            element={
              <RequireAuth>
                <NewPet />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
