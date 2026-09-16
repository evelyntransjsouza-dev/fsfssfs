import React, { useState, useEffect } from 'react';
import {
  StudioProfile,
  Specialty,
  CatalogItem,
  DaySchedule,
  BlockedSlot,
  Appointment,
  SupabaseConfig,
} from './types';
import { db, getSupabaseConfig, saveSupabaseConfig } from './lib/supabase';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ClientHero } from './components/client/ClientHero';
import { BratzShowcase } from './components/client/BratzShowcase';
import { CatalogShowcase } from './components/client/CatalogShowcase';
import { PricingTable } from './components/client/PricingTable';
import { BookingWizard } from './components/client/BookingWizard';
import { MyAppointments } from './components/client/MyAppointments';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminPanel } from './components/admin/AdminPanel';
import {
  INITIAL_STUDIO_PROFILE,
  INITIAL_SPECIALTIES,
  INITIAL_CATALOG,
  INITIAL_SCHEDULE,
} from './data/initialData';
import { Phone, Sparkles } from 'lucide-react';

export default function App() {
  // Global State
  const [profile, setProfile] = useState<StudioProfile>(INITIAL_STUDIO_PROFILE);
  const [specialties, setSpecialties] = useState<Specialty[]>(INITIAL_SPECIALTIES);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());

  // App UI State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'client' | 'admin'>('client');
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState<boolean>(false);
  const [preSelectedSpecialtyId, setPreSelectedSpecialtyId] = useState<string | null>(null);

  // Load Data on startup
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [prof, specs, cat, sched, blocked, apps] = await Promise.all([
          db.getProfile(),
          db.getSpecialties(),
          db.getCatalog(),
          db.getSchedule(),
          db.getBlockedSlots(),
          db.getAppointments(),
        ]);
        setProfile(prof);
        setSpecialties(specs);
        setCatalogItems(cat);
        setSchedule(sched);
        setBlockedSlots(blocked);
        setAppointments(apps);
        setSupabaseConfig(getSupabaseConfig());
      } catch (err) {
        console.error('Error initializing app data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Smooth scroll handler
  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'admin-view') {
      setActiveView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (activeView === 'admin') {
      setActiveView('client');
    }

    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Client Selection Handlers
  const handleSelectFromCatalog = (item: CatalogItem) => {
    if (item.specialtyId) {
      setPreSelectedSpecialtyId(item.specialtyId);
    } else {
      // Find matching specialty by category or title
      const matched = specialties.find(
        (s) => s.name.toLowerCase().includes('molde f1') || s.id === 'molde-f1-kiss'
      );
      if (matched) setPreSelectedSpecialtyId(matched.id);
    }
    handleNavigate('agendamento');
  };

  const handleSelectSpecialtyFromTable = (specialty: Specialty) => {
    setPreSelectedSpecialtyId(specialty.id);
    handleNavigate('agendamento');
  };

  // Appointment Submission
  const handleBookingComplete = async (appointment: Appointment) => {
    await db.createAppointment(appointment);
    const updated = await db.getAppointments();
    setAppointments(updated);
  };

  // Owner Operations
  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    await db.updateAppointmentStatus(id, status);
    const updated = await db.getAppointments();
    setAppointments(updated);
  };

  const handleDeleteAppointment = async (id: string) => {
    await db.deleteAppointment(id);
    const updated = await db.getAppointments();
    setAppointments(updated);
  };

  const handleSaveSchedule = async (newSchedule: DaySchedule[]) => {
    await db.saveSchedule(newSchedule);
    setSchedule(newSchedule);
  };

  const handleAddBlockedSlot = async (slot: BlockedSlot) => {
    const updated = [...blockedSlots, slot];
    await db.saveBlockedSlots(updated);
    setBlockedSlots(updated);
  };

  const handleDeleteBlockedSlot = async (id: string) => {
    const updated = blockedSlots.filter((s) => s.id !== id);
    await db.saveBlockedSlots(updated);
    setBlockedSlots(updated);
  };

  const handleAddManualAppointment = async (appointment: Appointment) => {
    await db.createAppointment(appointment);
    const updated = await db.getAppointments();
    setAppointments(updated);
  };

  const handleSaveSpecialties = async (newSpecialties: Specialty[]) => {
    await db.saveSpecialties(newSpecialties);
    setSpecialties(newSpecialties);
  };

  const handleSaveCatalog = async (newCatalog: CatalogItem[]) => {
    await db.saveCatalog(newCatalog);
    setCatalogItems(newCatalog);
  };

  const handleSaveProfile = async (newProfile: StudioProfile) => {
    await db.saveProfile(newProfile);
    setProfile(newProfile);
  };

  const handleSaveSupabaseConfig = async (newConfig: SupabaseConfig) => {
    saveSupabaseConfig(newConfig);
    setSupabaseConfig(newConfig);
  };

  const handleSyncAllToSupabase = async () => {
    return await db.syncAllToSupabase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-50/40 flex flex-col items-center justify-center p-4">
        <div className="relative w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin"></div>
          <Sparkles className="w-6 h-6 text-rose-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h2 className="font-serif-luxury text-xl font-bold text-stone-900 mb-1">
          Sabrina Lima Nails Designer
        </h2>
        <p className="text-xs text-rose-700 font-medium">
          Carregando catálogo e horários de Molde F1...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 text-stone-900 font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Header */}
      <Header
        profile={profile}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onExitAdmin={() => {
          setIsOwnerLoggedIn(false);
          setActiveView('client');
        }}
        onOpenMyAppointments={() => setIsMyAppointmentsOpen(true)}
        isOwnerLoggedIn={isOwnerLoggedIn}
      />

      {/* Main View: Client Site OR Owner Panel */}
      <main className="flex-1">
        {activeView === 'admin' && isOwnerLoggedIn ? (
          <AdminPanel
            studioProfile={profile}
            specialties={specialties}
            catalogItems={catalogItems}
            schedule={schedule}
            blockedSlots={blockedSlots}
            appointments={appointments}
            supabaseConfig={supabaseConfig}
            onExitAdmin={() => {
              setIsOwnerLoggedIn(false);
              setActiveView('client');
            }}
            onViewClientSite={() => setActiveView('client')}
            onUpdateStatus={handleUpdateStatus}
            onDeleteAppointment={handleDeleteAppointment}
            onSaveSchedule={handleSaveSchedule}
            onAddBlockedSlot={handleAddBlockedSlot}
            onDeleteBlockedSlot={handleDeleteBlockedSlot}
            onAddManualAppointment={handleAddManualAppointment}
            onSaveSpecialties={handleSaveSpecialties}
            onSaveCatalog={handleSaveCatalog}
            onSaveProfile={handleSaveProfile}
            onSaveSupabaseConfig={handleSaveSupabaseConfig}
            onSyncAllToSupabase={handleSyncAllToSupabase}
          />
        ) : (
          <div>
            {/* 1. Hero Presentation */}
            <ClientHero
              profile={profile}
              catalogItems={catalogItems}
              onBookNow={(specId) => {
                if (specId) setPreSelectedSpecialtyId(specId);
                handleNavigate('agendamento');
              }}
              onExploreCatalog={() => handleNavigate('catalogo')}
            />

            {/* 2. Coleção Oficial: Imagens das Bratz & Unhas Enviadas */}
            <BratzShowcase
              catalogItems={catalogItems}
              onBookNow={(specId) => {
                if (specId) setPreSelectedSpecialtyId(specId);
                handleNavigate('agendamento');
              }}
            />

            {/* 3. Video & Catalog Showcase (Highlighting Sabrina's videos!) */}
            <CatalogShowcase
              catalogItems={catalogItems}
              onSelectForBooking={handleSelectFromCatalog}
            />

            {/* 3. Procedures & Values Table */}
            <PricingTable
              specialties={specialties}
              onSelectSpecialty={handleSelectSpecialtyFromTable}
            />

            {/* 4. Client Booking Wizard */}
            <BookingWizard
              specialties={specialties}
              schedule={schedule}
              blockedSlots={blockedSlots}
              existingAppointments={appointments}
              studioProfile={profile}
              preSelectedSpecialtyId={preSelectedSpecialtyId}
              onBookingComplete={handleBookingComplete}
              onResetSelection={() => setPreSelectedSpecialtyId(null)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        profile={profile}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        isSupabaseConnected={supabaseConfig.isConnected}
      />

      {/* Floating WhatsApp Quick Button */}
      <a
        href={`https://wa.me/${profile.whatsappPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
          'Olá Sabrina Lima (@sbrnxv_nails)! Vi o aplicativo do studio e gostaria de mais informações sobre as unhas Molde F1. ✨💅'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
        title="Falar com Sabrina Lima no WhatsApp"
      >
        <Phone className="w-6 h-6 fill-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
          Falar no WhatsApp
        </span>
      </a>

      {/* Client Lookup Modal */}
      <MyAppointments
        isOpen={isMyAppointmentsOpen}
        onClose={() => setIsMyAppointmentsOpen(false)}
        appointments={appointments}
        studioProfile={profile}
      />

      {/* Owner Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        correctPin={profile.adminPin}
        onSuccess={() => {
          setIsOwnerLoggedIn(true);
          setActiveView('admin');
        }}
      />
    </div>
  );
}
