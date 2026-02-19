import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import PrivateRoute from '@/components/layout/PrivateRoute';
import AppShell from '@/components/layout/AppShell';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage';
import NewMeasurementPage from '@/pages/NewMeasurementPage';
import HistoryPage from '@/pages/HistoryPage';
import FamilyPage from '@/pages/FamilyPage';
import ProfilePage from '@/pages/ProfilePage';
import ScrollToTop from '@/components/layout/ScrollToTop';

function PrivatePage({ title, children }) {
    return (
        <PrivateRoute>
            <AppShell title={title}>
                {children}
            </AppShell>
        </PrivateRoute>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
                <Routes>
                    {/* ── Public routes ── */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* ── Protected routes ── */}
                    <Route path="/" element={<PrivatePage title="Inicio"><DashboardPage /></PrivatePage>} />

                    <Route path="/nueva-medicion" element={<PrivatePage title="Nueva medición"><NewMeasurementPage /></PrivatePage>} />

                    <Route path="/historial" element={<PrivatePage title="Historial"><HistoryPage /></PrivatePage>} />

                    <Route path="/familia" element={<PrivatePage title="Mi familia"><FamilyPage /></PrivatePage>} />

                    <Route path="/perfil" element={<PrivatePage title="Mi perfil"><ProfilePage /></PrivatePage>}/>

                    {/* Redirect any unknown routes to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
        
                <Toaster />
            </AuthProvider>
        </BrowserRouter>
    );
}