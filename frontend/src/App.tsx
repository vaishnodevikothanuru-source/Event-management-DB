import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RootLayout } from './layouts/RootLayout';
import { OrganizerLayout } from './layouts/OrganizerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { EventDiscoveryPage } from './pages/EventDiscoveryPage';
import { PublicEventDetailsPage } from './pages/PublicEventDetailsPage';
import { AttendeeDashboard } from './pages/AttendeeDashboard';
import { AgendaPage } from './pages/AgendaPage';
import { NetworkingPage } from './pages/NetworkingPage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { OrganizerEventWizard } from './pages/OrganizerEventWizard';
import { OrganizerAttendeesPage } from './pages/OrganizerAttendeesPage';
import { OrganizerEngagementPage } from './pages/OrganizerEngagementPage';
import { OrganizerAnalyticsPage } from './pages/OrganizerAnalyticsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';
import { PublicBadgePage } from './pages/PublicBadgePage';
import { DeviceMessageAlert } from './components/DeviceMessageAlert';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <DeviceMessageAlert />
        <Routes>
          {/* Public & Attendee Routes */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventDiscoveryPage />} />
            <Route path="/events/:slug" element={<PublicEventDetailsPage />} />
            <Route path="/dashboard" element={<AttendeeDashboard />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/networking" element={<NetworkingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Standalone Scannable Smart Badge Route */}
          <Route path="/pass/:token" element={<PublicBadgePage />} />

          {/* Organizer Portal Routes */}
          <Route path="/organizer" element={<OrganizerLayout />}>
            <Route index element={<Navigate to="/organizer/dashboard" replace />} />
            <Route path="dashboard" element={<OrganizerDashboard />} />
            <Route path="events/create" element={<OrganizerEventWizard />} />
            <Route path="attendees" element={<OrganizerAttendeesPage />} />
            <Route path="engagement" element={<OrganizerEngagementPage />} />
            <Route path="analytics" element={<OrganizerAnalyticsPage />} />
          </Route>

          {/* Admin Console Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
