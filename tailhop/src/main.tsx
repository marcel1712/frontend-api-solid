import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/RequireAuth'
import { AuthProvider } from '@/lib/auth'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { Home } from '@/pages/Home'
import { ManagePet } from '@/pages/ManagePet'
import { NewPet } from '@/pages/NewPet'
import { NotFound } from '@/pages/NotFound'
import { OrgDashboard } from '@/pages/OrgDashboard'
import { OrgLogin } from '@/pages/OrgLogin'
import { OrgSignup } from '@/pages/OrgSignup'
import { PetDetails } from '@/pages/PetDetails'
import { ResetPassword } from '@/pages/ResetPassword'
import { Pets } from '@/pages/Pets'
import { VerifyEmail } from '@/pages/VerifyEmail'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/ong" element={<OrgSignup />} />
          <Route path="/ong/entrar" element={<OrgLogin />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          {/* Os dois caminhos abaixo são ditados pelos links que a API monta
              nos e-mails, por isso estão em inglês. Mudá-los quebra e-mails já
              enviados. */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/ong/painel"
            element={
              <RequireAuth>
                <OrgDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/ong/painel/pets/:id"
            element={
              <RequireAuth>
                <ManagePet />
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
