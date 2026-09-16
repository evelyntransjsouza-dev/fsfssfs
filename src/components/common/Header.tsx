import React, { useState } from 'react';
import { StudioProfile } from '../../types';
import { Sparkles, Instagram, Calendar, Scissors, Lock, LogOut, Menu, X, Phone, BookmarkCheck } from 'lucide-react';

interface HeaderProps {
  profile: StudioProfile;
  activeView: 'client' | 'admin';
  onNavigate: (sectionId: string) => void;
  onOpenAdminLogin: () => void;
  onExitAdmin: () => void;
  onOpenMyAppointments: () => void;
  isOwnerLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeView,
  onNavigate,
  onOpenAdminLogin,
  onExitAdmin,
  onOpenMyAppointments,
  isOwnerLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100/80 shadow-xs">
      {/* Top micro banner for Instagram and announcement */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-stone-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/30 text-rose-200 border border-rose-400/30">
              Especialidade
            </span>
            <span className="hidden sm:inline text-rose-100 font-medium">
              Alongamento Perfeito no Molde F1 & Nail Art Exclusiva
            </span>
            <span className="sm:hidden text-rose-100 font-medium">Molde F1 & Nail Art</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={profile.instagramUrl || `https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-rose-200 hover:text-white transition-colors font-medium text-xs group"
              title="Acessar Instagram de Sabrina Lima"
            >
              <Instagram className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>{profile.instagramHandle}</span>
            </a>

            {isOwnerLoggedIn && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Modo Proprietária
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Studio Identity */}
          <div
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-rose-300/80 shadow-md group-hover:border-rose-500 transition-colors">
              <img
                src={profile.logoUrl}
                alt={profile.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/30 to-transparent"></div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-rose-900 transition-colors">
                  {profile.name}
                </h1>
                <Sparkles className="w-4 h-4 text-rose-500 fill-rose-300/40" />
              </div>
              <p className="text-xs text-stone-500 font-medium tracking-wide flex items-center gap-1">
                <span>{profile.subtitle || 'Molde F1 Nail Art'}</span>
                <span className="text-stone-300">•</span>
                <span className="text-rose-700 font-semibold">{profile.instagramHandle}</span>
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-sm font-medium text-stone-600">
            <button
              onClick={() => handleNavClick('colecao-bratz')}
              className="px-3 py-2 rounded-lg text-pink-700 hover:text-pink-900 hover:bg-pink-50/70 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              Coleção Bratz
            </button>

            <button
              onClick={() => handleNavClick('catalogo')}
              className="px-3 py-2 rounded-lg hover:text-rose-800 hover:bg-rose-50/60 transition-colors flex items-center gap-1.5"
            >
              <Scissors className="w-4 h-4 text-rose-600" />
              Catálogo de Unhas
            </button>

            <button
              onClick={() => handleNavClick('valores')}
              className="px-3 py-2 rounded-lg hover:text-rose-800 hover:bg-rose-50/60 transition-colors"
            >
              Procedimentos & Valores
            </button>

            <button
              onClick={onOpenMyAppointments}
              className="px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1.5"
            >
              <BookmarkCheck className="w-4 h-4 text-stone-500" />
              Meus Horários
            </button>

            <button
              onClick={() => handleNavClick('agendamento')}
              className="ml-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              Agendar Molde F1
            </button>

            {/* Owner Toggle Button */}
            <div className="ml-3 pl-3 border-l border-stone-200">
              {isOwnerLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavClick('admin-view')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeView === 'admin'
                        ? 'bg-rose-900 text-white shadow-xs'
                        : 'bg-rose-100/70 text-rose-900 hover:bg-rose-200'
                    }`}
                  >
                    Painel da Sabrina
                  </button>
                  <button
                    onClick={onExitAdmin}
                    title="Sair do modo proprietária"
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-rose-800 hover:bg-rose-50/60 border border-stone-200 hover:border-rose-300 transition-all flex items-center gap-1.5"
                  title="Acesso exclusivo para Sabrina (Dona do Studio)"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Área da Sabrina</span>
                </button>
              )}
            </div>
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('agendamento')}
              className="px-3 py-1.5 rounded-full bg-rose-600 text-white font-medium text-xs shadow-xs"
            >
              Agendar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 gap-2 pt-2 text-stone-700 font-medium text-sm">
            <button
              onClick={() => handleNavClick('catalogo')}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-800"
            >
              <Scissors className="w-4 h-4 text-rose-600" />
              Catálogo de Unhas (Vídeos e Fotos)
            </button>
            <button
              onClick={() => handleNavClick('valores')}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-800"
            >
              <Sparkles className="w-4 h-4 text-rose-600" />
              Procedimentos & Tabela de Valores
            </button>
            <button
              onClick={() => {
                onOpenMyAppointments();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-800"
            >
              <BookmarkCheck className="w-4 h-4 text-rose-600" />
              Consultar Meus Agendamentos
            </button>
            <button
              onClick={() => handleNavClick('agendamento')}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold shadow-md mt-2"
            >
              <Calendar className="w-4 h-4" />
              Agendar Horário Molde F1
            </button>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <a
              href={`https://wa.me/${profile.whatsappPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-600 hover:text-emerald-600 font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              Falar no WhatsApp
            </a>

            {isOwnerLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('admin-view')}
                  className="px-3 py-1.5 bg-rose-900 text-white rounded-lg font-medium"
                >
                  Painel Dono
                </button>
                <button
                  onClick={onExitAdmin}
                  className="p-1.5 text-stone-500 hover:text-rose-600"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-rose-800 font-medium"
              >
                <Lock className="w-3 h-3 text-stone-400" />
                Acesso Sabrina (Dono)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
