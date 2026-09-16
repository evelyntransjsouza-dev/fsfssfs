import React, { useState } from 'react';
import {
  StudioProfile,
  Specialty,
  CatalogItem,
  DaySchedule,
  BlockedSlot,
  Appointment,
  SupabaseConfig,
} from '../../types';
import { ScheduleManager } from './ScheduleManager';
import { SpecialtiesManager } from './SpecialtiesManager';
import { CatalogManager } from './CatalogManager';
import { StudioSettings } from './StudioSettings';
import { formatCurrency } from '../../lib/utils';
import {
  Calendar,
  DollarSign,
  Users,
  Scissors,
  Settings,
  Eye,
  LogOut,
  Sparkles,
  Database,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface AdminPanelProps {
  studioProfile: StudioProfile;
  specialties: Specialty[];
  catalogItems: CatalogItem[];
  schedule: DaySchedule[];
  blockedSlots: BlockedSlot[];
  appointments: Appointment[];
  supabaseConfig: SupabaseConfig;
  onExitAdmin: () => void;
  onViewClientSite: () => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  onSaveSchedule: (newSchedule: DaySchedule[]) => Promise<void>;
  onAddBlockedSlot: (slot: BlockedSlot) => Promise<void>;
  onDeleteBlockedSlot: (id: string) => Promise<void>;
  onAddManualAppointment: (appointment: Appointment) => Promise<void>;
  onSaveSpecialties: (newSpecialties: Specialty[]) => Promise<void>;
  onSaveCatalog: (newCatalog: CatalogItem[]) => Promise<void>;
  onSaveProfile: (newProfile: StudioProfile) => Promise<void>;
  onSaveSupabaseConfig: (newConfig: SupabaseConfig) => Promise<void>;
  onSyncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  studioProfile,
  specialties,
  catalogItems,
  schedule,
  blockedSlots,
  appointments,
  supabaseConfig,
  onExitAdmin,
  onViewClientSite,
  onUpdateStatus,
  onDeleteAppointment,
  onSaveSchedule,
  onAddBlockedSlot,
  onDeleteBlockedSlot,
  onAddManualAppointment,
  onSaveSpecialties,
  onSaveCatalog,
  onSaveProfile,
  onSaveSupabaseConfig,
  onSyncAllToSupabase,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'specialties' | 'catalog' | 'settings'>('overview');

  // Overview metrics calculations
  const pendingCount = appointments.filter((a) => a.status === 'pendente').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmado').length;
  const totalRevenue = appointments
    .filter((a) => a.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="min-h-screen bg-stone-100/60 pb-20">
      {/* Admin Top Header */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Scissors className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Painel da Proprietária: {studioProfile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-400/30">
                    Acesso Dono
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Instagram oficial: <strong>{studioProfile.instagramHandle}</strong> • Especialista em Molde F1
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onViewClientSite}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-stone-700"
              >
                <Eye className="w-3.5 h-3.5 text-rose-400" />
                <span>Ver Site dos Clientes</span>
              </button>

              <button
                onClick={onExitAdmin}
                className="px-3 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-800"
                title="Sair do painel administrativo"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 pt-6 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer relative ${
                activeTab === 'schedule'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda & Horários</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('specialties')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'specialties'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Especialidades & Preços</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>Catálogo & Portfólio</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Nome do Studio, Logo & Supabase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-500 uppercase">Agendamentos Totais</span>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-serif-luxury text-stone-900">
                  {appointments.length}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {confirmedCount} confirmados • {pendingCount} pendentes
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-500 uppercase">Faturamento Previsto</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-serif-luxury text-emerald-900">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="text-xs text-stone-500 mt-1">Soma dos agendamentos ativos</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-500 uppercase">Especialidades Ativas</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Scissors className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-serif-luxury text-stone-900">
                  {specialties.length}
                </div>
                <p className="text-xs text-stone-500 mt-1">Procedimentos cadastrados</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-500 uppercase">Trabalhos no Catálogo</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-serif-luxury text-stone-900">
                  {catalogItems.length}
                </div>
                <p className="text-xs text-stone-500 mt-1">Inclui vídeos e fotos</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Today / Next */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-luxury text-xl font-bold text-stone-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-600" />
                    <span>Próximos Atendimentos Agendados</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900"
                  >
                    Ver Todos →
                  </button>
                </div>

                {appointments.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-900 text-sm">{app.clientName}</span>
                      <p className="text-stone-500">{app.specialtyName}</p>
                      <p className="text-rose-800 font-semibold mt-0.5">
                        📅 {app.date} às {app.time}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-serif-luxury text-rose-950 text-sm block">
                        {formatCurrency(app.totalPrice)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status and Fast Links */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-stone-900 mb-2">
                    Status do Studio & Supabase
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    Suas configurações atuais de funcionamento e conexão com o banco de dados.
                  </p>

                  <div className="space-y-2.5 text-xs text-stone-700">
                    <div className="flex justify-between p-2.5 rounded-xl bg-stone-50">
                      <span className="text-stone-500">Nome do Studio:</span>
                      <strong className="text-stone-900">{studioProfile.name}</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-stone-50">
                      <span className="text-stone-500">Instagram:</span>
                      <strong className="text-rose-700">{studioProfile.instagramHandle}</strong>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-stone-50">
                      <span className="text-stone-500">Banco Supabase:</span>
                      <strong className={supabaseConfig.isConnected ? 'text-emerald-700 font-bold' : 'text-stone-600'}>
                        {supabaseConfig.isConnected ? 'Conectado na Nuvem' : 'Armazenamento Local Ativo'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex gap-3">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configurar Studio & Supabase</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>Gerenciar Catálogo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE MANAGER */}
        {activeTab === 'schedule' && (
          <ScheduleManager
            appointments={appointments}
            schedule={schedule}
            blockedSlots={blockedSlots}
            specialties={specialties}
            studioProfile={studioProfile}
            onUpdateStatus={onUpdateStatus}
            onDeleteAppointment={onDeleteAppointment}
            onSaveSchedule={onSaveSchedule}
            onAddBlockedSlot={onAddBlockedSlot}
            onDeleteBlockedSlot={onDeleteBlockedSlot}
            onAddManualAppointment={onAddManualAppointment}
          />
        )}

        {/* TAB 3: SPECIALTIES & VALUES */}
        {activeTab === 'specialties' && (
          <SpecialtiesManager
            specialties={specialties}
            onSaveSpecialties={onSaveSpecialties}
          />
        )}

        {/* TAB 4: CATALOG & PORTFOLIO */}
        {activeTab === 'catalog' && (
          <CatalogManager
            catalogItems={catalogItems}
            onSaveCatalog={onSaveCatalog}
          />
        )}

        {/* TAB 5: STUDIO SETTINGS & SUPABASE */}
        {activeTab === 'settings' && (
          <StudioSettings
            profile={studioProfile}
            supabaseConfig={supabaseConfig}
            onSaveProfile={onSaveProfile}
            onSaveSupabaseConfig={onSaveSupabaseConfig}
            onSyncAllToSupabase={onSyncAllToSupabase}
          />
        )}
      </div>
    </div>
  );
};
