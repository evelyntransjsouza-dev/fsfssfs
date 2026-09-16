import React from 'react';
import { StudioProfile } from '../../types';
import { Instagram, Phone, Sparkles, MapPin, Heart, Shield, Database } from 'lucide-react';

interface FooterProps {
  profile: StudioProfile;
  onOpenAdminLogin: () => void;
  isSupabaseConnected: boolean;
}

export const Footer: React.FC<FooterProps> = ({ profile, onOpenAdminLogin, isSupabaseConnected }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Studio Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-rose-500/50 shadow-xs">
                <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl font-bold text-white tracking-tight">
                  {profile.name}
                </h3>
                <p className="text-xs text-rose-400 font-medium">{profile.subtitle || 'Especialista em Molde F1'}</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-md">
              {profile.bio ||
                'Excelência em unhas de luxo, técnica inovadora de Molde F1 com acabamento ultra natural, alta durabilidade e nail art exclusiva.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={profile.instagramUrl || `https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800 hover:bg-rose-950 text-rose-300 hover:text-white text-xs font-semibold transition-colors border border-stone-700"
              >
                <Instagram className="w-4 h-4 text-rose-400" />
                <span>{profile.instagramHandle}</span>
              </a>
              <a
                href={`https://wa.me/${profile.whatsappPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 hover:text-white text-xs font-semibold transition-colors border border-emerald-800/40"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Details */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Especialidades
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="hover:text-rose-300 transition-colors">✨ Alongamento Molde F1</li>
              <li className="hover:text-rose-300 transition-colors">✨ Francesa Reversa & Kiss Art</li>
              <li className="hover:text-rose-300 transition-colors">✨ Coleção Luxo Ouro & Joias 3D</li>
              <li className="hover:text-rose-300 transition-colors">✨ Manutenção Molde F1</li>
              <li className="hover:text-rose-300 transition-colors">✨ Blindagem Diamante</li>
            </ul>
          </div>

          {/* Location & Access */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-200 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              Atendimento
            </h4>
            <p className="text-sm text-stone-400 leading-relaxed mb-3">
              {profile.location || 'Atendimento com horário previamente agendado no studio.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Database className="w-3.5 h-3.5 text-rose-400" />
              <span>Banco Supabase: {isSupabaseConnected ? 'Sincronizado' : 'Modo Ativo'}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800">
              <button
                onClick={onOpenAdminLogin}
                className="text-xs text-stone-500 hover:text-stone-300 flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-3 h-3 text-stone-600" />
                Acesso Administrativo (Dono)
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} {profile.name}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> para clientes de Sabrina Lima ({profile.instagramHandle})
          </p>
        </div>
      </div>
    </footer>
  );
};
