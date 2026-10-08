import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SphereAIWidget } from '../components/SphereAIWidget';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SphereAIWidget />
    </div>
  );
};
