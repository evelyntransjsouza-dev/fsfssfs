import React, { useState } from 'react';
import { Appointment, DaySchedule, BlockedSlot, Specialty, StudioProfile } from '../../types';
import { formatCurrency, formatDateBR, formatDayOfWeek, getWhatsAppUrl } from '../../lib/utils';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Phone,
  AlertTriangle,
  User,
  ShieldCheck,
  Save,
  MessageCircle,
} from 'lucide-react';

interface ScheduleManagerProps {
  appointments: Appointment[];
  schedule: DaySchedule[];
  blockedSlots: BlockedSlot[];
  specialties: Specialty[];
  studioProfile: StudioProfile;
  onUpdateStatus: (appointmentId: string, status: Appointment['status']) => Promise<void>;
  onDeleteAppointment: (appointmentId: string) => Promise<void>;
  onSaveSchedule: (newSchedule: DaySchedule[]) => Promise<void>;
  onAddBlockedSlot: (slot: BlockedSlot) => Promise<void>;
  onDeleteBlockedSlot: (id: string) => Promise<void>;
  onAddManualAppointment: (appointment: Appointment) => Promise<void>;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  appointments,
  schedule,
  blockedSlots,
  specialties,
  studioProfile,
  onUpdateStatus,
  onDeleteAppointment,
  onSaveSchedule,
  onAddBlockedSlot,
  onDeleteBlockedSlot,
  onAddManualAppointment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'scheduleConfig' | 'blockedDates'>('appointments');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterDate, setFilterDate] = useState<string>('');

  // Editable schedule state
  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>(schedule);
  const [scheduleSaved, setScheduleSaved] = useState<boolean>(false);

  // New blocked slot form state
  const [newBlockedDate, setNewBlockedDate] = useState<string>('');
  const [newBlockedReason, setNewBlockedReason] = useState<string>('');

  // Manual booking modal state
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualPhone, setManualPhone] = useState<string>('');
  const [manualDate, setManualDate] = useState<string>('');
  const [manualTime, setManualTime] = useState<string>('14:00');
  const [manualSpecialtyId, setManualSpecialtyId] = useState<string>(specialties[0]?.id || '');
  const [manualNotes, setManualNotes] = useState<string>('');

  const handleDayToggle = (dayOfWeek: number) => {
    setLocalSchedule(
      localSchedule.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, isEnabled: !day.isEnabled } : day
      )
    );
  };

  const handleDayChange = (dayOfWeek: number, field: keyof DaySchedule, value: any) => {
    setLocalSchedule(
      localSchedule.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSaveScheduleConfig = async () => {
    await onSaveSchedule(localSchedule);
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 3000);
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    const newSlot: BlockedSlot = {
      id: 'blocked-' + Date.now(),
      date: newBlockedDate,
      reason: newBlockedReason.trim() || 'Folga / Feriado',
      isFullDay: true,
    };
    await onAddBlockedSlot(newSlot);
    setNewBlockedDate('');
    setNewBlockedReason('');
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualPhone || !manualDate || !manualTime) return;

    const spec = specialties.find((s) => s.id === manualSpecialtyId) || specialties[0];
    const newApp: Appointment = {
      id: 'manual-' + Date.now(),
      clientName: manualName.trim(),
      clientPhone: manualPhone.trim(),
      specialtyId: spec.id,
      specialtyName: spec.name,
      totalPrice: spec.price,
      date: manualDate,
      time: manualTime,
      status: 'confirmado',
      notes: manualNotes.trim() || 'Agendamento manual inserido pela Sabrina',
      createdAt: new Date().toISOString(),
    };

    await onAddManualAppointment(newApp);
    setShowManualModal(false);
    setManualName('');
    setManualPhone('');
    setManualDate('');
    setManualNotes('');
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((app) => {
    if (filterStatus !== 'todos' && app.status !== filterStatus) return false;
    if (filterDate && app.date !== filterDate) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'appointments'
                ? 'bg-rose-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-rose-50'
            }`}
          >
            📋 Atendimentos & Clientes ({appointments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('scheduleConfig')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'scheduleConfig'
                ? 'bg-rose-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-rose-50'
            }`}
          >
            ⏰ Dias & Horários de Atendimento
          </button>
          <button
            onClick={() => setActiveSubTab('blockedDates')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'blockedDates'
                ? 'bg-rose-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-rose-50'
            }`}
          >
            🚫 Bloquear Folgas ({blockedSlots.length})
          </button>
        </div>

        {activeSubTab === 'appointments' && (
          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inserir Horário Manualmente</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: APPOINTMENTS LIST */}
      {activeSubTab === 'appointments' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase">Filtrar por:</span>
              {['todos', 'pendente', 'confirmado', 'concluido', 'cancelado'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    filterStatus === st
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Por Data:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-1 text-xs rounded-lg border border-stone-300 bg-white"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {filteredAppointments.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center text-stone-500 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-stone-300" />
              <p className="font-bold text-stone-800">Nenhum agendamento encontrado.</p>
              <p className="text-xs">Quando um cliente agendar pelo site ou você adicionar manualmente, aparecerá aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((app) => {
                const clientCleanPhone = app.clientPhone.replace(/\D/g, '');
                const whatsappClientMsg = encodeURIComponent(
                  `Olá ${app.clientName}! Aqui é a Sabrina Lima Nails Designer (@sbrnxv_nails). Estou entrando em contato para confirmar seu agendamento de ${app.specialtyName} para o dia ${formatDateBR(app.date)} às ${app.time}. Te aguardo com carinho! 💅✨`
                );

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top status & date */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                          {formatDateBR(app.date)} • {app.time}
                        </span>

                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            app.status === 'confirmado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'pendente'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'concluido'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      {/* Client name & specialty */}
                      <h4 className="font-serif-luxury text-lg font-bold text-stone-900 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-rose-600" />
                        <span>{app.clientName}</span>
                      </h4>

                      <p className="text-xs font-semibold text-rose-800 mt-1">
                        💅 {app.specialtyName}
                      </p>

                      <p className="text-xs text-stone-500 mt-1">
                        📱 WhatsApp: <strong>{app.clientPhone}</strong>
                        {app.clientInstagram && (
                          <span className="ml-2 text-rose-600 font-medium">({app.clientInstagram})</span>
                        )}
                      </p>

                      {app.notes && (
                        <p className="text-[11px] text-stone-600 mt-2 bg-stone-50 p-2 rounded-lg italic">
                          "{app.notes}"
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-stone-800 pt-2 border-t border-stone-100">
                        <span>Valor:</span>
                        <span className="text-base font-bold font-serif-luxury text-rose-950">
                          {formatCurrency(app.totalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Quick status management actions */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        {app.status !== 'confirmado' && (
                          <button
                            onClick={() => onUpdateStatus(app.id, 'confirmado')}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmar</span>
                          </button>
                        )}
                        {app.status !== 'concluido' && (
                          <button
                            onClick={() => onUpdateStatus(app.id, 'concluido')}
                            className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Concluir</span>
                          </button>
                        )}
                        {app.status !== 'cancelado' && (
                          <button
                            onClick={() => onUpdateStatus(app.id, 'cancelado')}
                            className="py-1.5 px-2.5 bg-stone-100 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                            title="Cancelar agendamento"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* WhatsApp Client Direct Chat */}
                      <a
                        href={`https://wa.me/${clientCleanPhone}?text=${whatsappClientMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Conversar no WhatsApp da Cliente</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: WORKING HOURS & SCHEDULE CONFIG */}
      {activeSubTab === 'scheduleConfig' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
              Grade Semanal de Horários Disponíveis
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Defina quais dias da semana você atende no Studio, seu horário de início/término, intervalo de almoço e o tempo de cada slot (para o Molde F1).
            </p>
          </div>

          <div className="space-y-4">
            {localSchedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`p-4 rounded-2xl border transition-all ${
                  day.isEnabled ? 'border-rose-200 bg-rose-50/20' : 'border-stone-200 bg-stone-50 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={day.isEnabled}
                      onChange={() => handleDayToggle(day.dayOfWeek)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="font-bold text-stone-900 text-sm">{day.dayName}</span>
                    <span className="text-[11px] font-semibold text-stone-500">
                      {day.isEnabled ? '(Atendimento Aberto)' : '(Folga)'}
                    </span>
                  </div>

                  {day.isEnabled && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-stone-500">Das:</span>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => handleDayChange(day.dayOfWeek, 'startTime', e.target.value)}
                          className="px-2 py-1 rounded-lg border border-stone-300 font-mono bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-stone-500">às:</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => handleDayChange(day.dayOfWeek, 'endTime', e.target.value)}
                          className="px-2 py-1 rounded-lg border border-stone-300 font-mono bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-stone-500">Almoço:</span>
                        <input
                          type="time"
                          value={day.breakStart || '12:30'}
                          onChange={(e) => handleDayChange(day.dayOfWeek, 'breakStart', e.target.value)}
                          className="px-2 py-1 rounded-lg border border-stone-300 font-mono bg-white"
                        />
                        <span className="text-stone-400">-</span>
                        <input
                          type="time"
                          value={day.breakEnd || '13:30'}
                          onChange={(e) => handleDayChange(day.dayOfWeek, 'breakEnd', e.target.value)}
                          className="px-2 py-1 rounded-lg border border-stone-300 font-mono bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            {scheduleSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Horários salvos com sucesso!
              </span>
            ) : (
              <span></span>
            )}

            <button
              onClick={handleSaveScheduleConfig}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações da Grade</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 3: BLOCKED DATES & VACATION */}
      {activeSubTab === 'blockedDates' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
              Bloqueio de Datas Específicas & Folgas
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Precisa tirar um dia de folga, viajar ou ir a um curso de unhas? Adicione a data abaixo para que nenhum cliente consiga agendar nesse dia.
            </p>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddBlockedDate} className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Data para Bloquear
              </label>
              <input
                type="date"
                required
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-sm"
              />
            </div>

            <div className="flex-2 w-full">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Motivo / Descrição (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Curso de Molde F1 Avançado / Feriado / Folga"
                value={newBlockedReason}
                onChange={(e) => setNewBlockedReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Bloquear Data</span>
            </button>
          </form>

          {/* List of blocked dates */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Datas Atualmente Bloqueadas
            </h4>
            {blockedSlots.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Nenhuma data bloqueada no momento. Todos os dias ativos na grade estão disponíveis.</p>
            ) : (
              blockedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-stone-900">
                      📅 {formatDateBR(slot.date)} ({formatDayOfWeek(slot.date)})
                    </span>
                    <span className="text-stone-600">— {slot.reason}</span>
                  </div>

                  <button
                    onClick={() => onDeleteBlockedSlot(slot.id)}
                    className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition-colors"
                    title="Desbloquear data"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MANUAL BOOKING MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                Novo Horário Manual
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nome da Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">WhatsApp da Cliente *</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Procedimento *</label>
                <select
                  value={manualSpecialtyId}
                  onChange={(e) => setManualSpecialtyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatCurrency(s.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Notas internas"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl border text-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
