import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

import { AuthProvider } from '@/lib/auth-context';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomePage } from '@/pages/Home';
import { SignupPage } from '@/pages/Signup';
import { AuthVerifyPage } from '@/pages/AuthVerify';
import { DashboardPage } from '@/pages/Dashboard';
import { OwnedNamespacesPage } from '@/pages/OwnedNamespaces';
import { SharedNamespacesPage } from '@/pages/SharedNamespaces';
import { NamespaceDetailsPage } from '@/pages/NamespaceDetails';
import { ActiveRegistriesPage } from '@/pages/ActiveRegistries';
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
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/verify" element={<AuthVerifyPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/namespaces/owned" element={<OwnedNamespacesPage />} />
            <Route path="/namespaces/shared" element={<SharedNamespacesPage />} />
            <Route path="/namespaces/:namespaceId/active" element={<ActiveRegistriesPage />} />
            <Route path="/namespaces/:namespaceId/revoked" element={<RevokedRegistriesPage />} />
            <Route path="/namespaces/:namespaceId" element={<NamespaceDetailsPage />} />
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