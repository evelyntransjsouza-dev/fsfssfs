import React from 'react';
import { StudioProfile } from '../../types';
import { Instagram, Phone, Sparkles, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  profile: StudioProfile;
  onOpenAdminLogin: () => void;
  isSupabaseConnected?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ profile, onOpenAdminLogin }) => {
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

          {/* Location & Schedule */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-200 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              Atendimento
            </h4>
            <p className="text-sm text-stone-400 leading-relaxed mb-3">
              {profile.location || 'Atendimento com horário previamente agendado no studio.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-rose-300/80">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Atendimento exclusivo com hora marcada</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} {profile.name}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1 text-stone-400">
            <span>Feito com</span>
            <button
              type="button"
              onClick={onOpenAdminLogin}
              title="Studio Sabrina Lima"
              aria-label="Acesso exclusivo da Sabrina"
              className="inline-flex items-center justify-center p-0.5 rounded-full hover:scale-135 active:scale-90 transition-transform duration-200 cursor-pointer focus:outline-hidden group"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 transition-colors group-hover:text-rose-400 group-hover:fill-rose-400" />
            </button>
            <span>para clientes de Sabrina Lima ({profile.instagramHandle})</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
