import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

import { AuthProvider } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/Home';
import { LoginPage } from '@/pages/Login';
import { SignupPage } from '@/pages/Signup';
import { DashboardPage } from '@/pages/Dashboard';
import { NamespaceDetailsPage } from '@/pages/NamespaceDetails';
import { RevokedRegistriesPage } from '@/pages/RevokedRegistries';
import { RecordsPage } from '@/pages/Records';
import { RecordDetailsPage } from '@/pages/RecordDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/namespaces/:namespaceId" element={<NamespaceDetailsPage />} />
            <Route path="/namespaces/:namespaceId/revoked" element={<RevokedRegistriesPage />} />
            <Route path="/:namespaceId/:registryName" element={<RecordsPage />} />
            <Route path="/:namespaceId/:registryName/:recordName" element={<RecordDetailsPage />} />
          </Routes>
        </MainLayout>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;