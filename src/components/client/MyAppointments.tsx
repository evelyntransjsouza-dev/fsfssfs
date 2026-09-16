import React, { useState } from 'react';
import { Appointment, StudioProfile } from '../../types';
import { formatCurrency, formatDateBR, formatDayOfWeek, getWhatsAppUrl } from '../../lib/utils';
import { X, Search, Calendar, Clock, Phone, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface MyAppointmentsProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  studioProfile: StudioProfile;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({
  isOpen,
  onClose,
  appointments,
  studioProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const cleanTerm = searchTerm.replace(/\D/g, '');

  const filteredAppointments = appointments.filter((app) => {
    if (!searchTerm.trim()) return false;
    const phoneMatch = cleanTerm && app.clientPhone.replace(/\D/g, '').includes(cleanTerm);
    const nameMatch = app.clientName.toLowerCase().includes(searchTerm.toLowerCase().trim());
    return phoneMatch || nameMatch;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Confirmado
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
            Consulta de Clientes
          </div>
          <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
            Meus Agendamentos
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Digite seu número de WhatsApp ou seu nome para visualizar seus horários agendados.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Digite seu WhatsApp ou Nome..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearched(true);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-hidden text-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {!searched || !searchTerm.trim() ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              Digite seus dados no campo acima para localizar seus horários.
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs bg-stone-50 rounded-2xl p-4">
              Nenhum agendamento encontrado para "{searchTerm}". Verifique o número ou agende um novo horário!
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 space-y-2 hover:border-rose-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-sm">{app.specialtyName}</span>
                  {getStatusBadge(app.status)}
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>{formatDateBR(app.date)} ({formatDayOfWeek(app.date)})</span>
                    <span className="text-stone-300">•</span>
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>{app.time}</span>
                  </p>
                  <p><strong>Valor:</strong> {formatCurrency(app.totalPrice)}</p>
                  {app.selectedAddOns && app.selectedAddOns.length > 0 && (
                    <p className="text-[11px] text-stone-500">
                      Adicionais: {app.selectedAddOns.join(', ')}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-rose-100/80 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">Cliente: {app.clientName}</span>
                  <a
                    href={getWhatsAppUrl(
                      studioProfile.whatsappPhone,
                      encodeURIComponent(
                        `Olá Sabrina! Gostaria de tirar uma dúvida sobre meu agendamento de ${app.specialtyName} no dia ${formatDateBR(app.date)} às ${app.time}.`
                      )
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    Falar com Sabrina
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
