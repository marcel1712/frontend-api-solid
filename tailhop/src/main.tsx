import '@fontsource/fredoka/latin-500.css'
import '@fontsource/fredoka/latin-600.css'
import '@fontsource/fredoka/latin-700.css'
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import { lazy, StrictMode, Suspense, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/RequireAuth'
import { AuthProvider } from '@/lib/auth'
import { startMonitoring } from '@/lib/monitoring'
import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'

/**
 * Só a home (a porta de entrada) e a 404 vão no pacote inicial. O resto baixa
 * ao abrir: quem só procura um pet nunca carrega o painel da ONG, o admin ou
 * o texto das páginas legais.
 */
function page<K extends string>(
  load: () => Promise<Record<K, ComponentType>>,
  name: K,
) {
  return lazy(() => load().then((module) => ({ default: module[name] })))
}

const Pets = page(() => import('@/pages/Pets'), 'Pets')
const PetDetails = page(() => import('@/pages/PetDetails'), 'PetDetails')
const OrgSignup = page(() => import('@/pages/OrgSignup'), 'OrgSignup')
const OrgLogin = page(() => import('@/pages/OrgLogin'), 'OrgLogin')
const ForgotPassword = page(() => import('@/pages/ForgotPassword'), 'ForgotPassword')
const ResetPassword = page(() => import('@/pages/ResetPassword'), 'ResetPassword')
const VerifyEmail = page(() => import('@/pages/VerifyEmail'), 'VerifyEmail')
const OrgDashboard = page(() => import('@/pages/OrgDashboard'), 'OrgDashboard')
const ManagePet = page(() => import('@/pages/ManagePet'), 'ManagePet')
const NewPet = page(() => import('@/pages/NewPet'), 'NewPet')
const AdminReview = page(() => import('@/pages/AdminReview'), 'AdminReview')
const Privacy = page(() => import('@/pages/Privacy'), 'Privacy')
const Terms = page(() => import('@/pages/Terms'), 'Terms')
import './index.css'

startMonitoring()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* Sem spinner: os pedaços são pequenos e chegam antes de um
            indicador valer a pena — ele só piscaria. */}
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/:id" element={<PetDetails />} />
            <Route path="/ong" element={<OrgSignup />} />
            <Route path="/ong/entrar" element={<OrgLogin />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/termos" element={<Terms />} />
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
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminReview />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
