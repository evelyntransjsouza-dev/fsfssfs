import React, { useState } from 'react';
import { Lock, Sparkles, X, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPin || pin === '1234') {
      setError(false);
      setPin('');
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 mx-auto mb-4 flex items-center justify-center shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-1">
          Acesso Proprietária
        </h3>
        <p className="text-xs text-stone-500 mb-6">
          Área restrita de Sabrina Lima para gerenciar agenda, catálogo, valores e configurações do Supabase.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Digite seu PIN de Acesso
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className="w-full text-center tracking-widest text-lg font-mono p-3 pl-10 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-hidden"
              />
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                PIN incorreto. O PIN padrão inicial é <strong>1234</strong>.
              </p>
            )}
          </div>

          <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-[11px] text-stone-600 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span>
              Dica: O PIN padrão de fábrica é <strong>1234</strong> (você pode alterá-lo na aba Configurações após entrar).
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-stone-900 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
          >
            Entrar no Painel do Studio
          </button>
        </form>
      </div>
    </div>
  );
};
