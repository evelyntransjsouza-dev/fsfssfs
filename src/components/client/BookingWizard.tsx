import React, { useState, useEffect } from 'react';
import { Specialty, DaySchedule, BlockedSlot, Appointment, StudioProfile } from '../../types';
import { formatCurrency, formatDateBR, formatDayOfWeek, generateWhatsAppBookingMessage, getWhatsAppUrl, generateSlotsForDay } from '../../lib/utils';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Send,
  User,
  Phone,
  Instagram,
  FileText,
  AlertCircle,
  Scissors,
} from 'lucide-react';

interface BookingWizardProps {
  specialties: Specialty[];
  schedule: DaySchedule[];
  blockedSlots: BlockedSlot[];
  existingAppointments: Appointment[];
  studioProfile: StudioProfile;
  preSelectedSpecialtyId?: string | null;
  onBookingComplete: (appointment: Appointment) => Promise<void>;
  onResetSelection: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  specialties,
  schedule,
  blockedSlots,
  existingAppointments,
  studioProfile,
  preSelectedSpecialtyId,
  onBookingComplete,
  onResetSelection,
}) => {
  // Wizard steps: 1 = Procedimento, 2 = Data e Horário, 3 = Dados Pessoais, 4 = Confirmado
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>(
    preSelectedSpecialtyId || specialties[0]?.id || ''
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Date selection (default to tomorrow or next business day)
  const getInitialDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Client Data
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientInstagram, setClientInstagram] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);

  // Sync with preSelectedSpecialtyId from catalog
  useEffect(() => {
    if (preSelectedSpecialtyId) {
      setSelectedSpecialtyId(preSelectedSpecialtyId);
      // If user came from catalog, jump straight to date selection
      setCurrentStep(2);
    }
  }, [preSelectedSpecialtyId]);

  const selectedSpecialty = specialties.find((s) => s.id === selectedSpecialtyId) || specialties[0];

  // Optional Add-ons available
  const availableAddOns = [
    { id: 'kiss-art-extra', name: 'Nail Art Beijinhos / Kiss Desenho', price: 20 },
    { id: 'strass-luxo', name: 'Aplicação de Strass Swarovski', price: 25 },
    { id: 'efeito-cromo', name: 'Efeito Cromo Ouro Metálico', price: 30 },
    { id: 'formato-extra-longo', name: 'Comprimento Extra Longo (XL)', price: 20 },
  ];

  const toggleAddOn = (id: string) => {
    if (selectedAddOns.includes(id)) {
      setSelectedAddOns(selectedAddOns.filter((item) => item !== id));
    } else {
      setSelectedAddOns([...selectedAddOns, id]);
    }
  };

  const calculateTotalPrice = () => {
    let total = selectedSpecialty?.price || 0;
    selectedAddOns.forEach((addonId) => {
      const addon = availableAddOns.find((a) => a.id === addonId);
      if (addon) total += addon.price;
    });
    return total;
  };

  // Check date availability based on Sabrina's schedule
  const getDayOfWeekIndex = (dateStr: string): number => {
    if (!dateStr) return 1;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getDay();
  };

  const currentDayIndex = getDayOfWeekIndex(selectedDate);
  const dayConfig = schedule.find((s) => s.dayOfWeek === currentDayIndex) || {
    dayOfWeek: currentDayIndex,
    dayName: '',
    isEnabled: true,
    startTime: '09:00',
    endTime: '19:00',
    slotDurationMinutes: 120,
  };

  const isDayBlocked = blockedSlots.some((b) => b.date === selectedDate && b.isFullDay);
  const blockedRecord = blockedSlots.find((b) => b.date === selectedDate);

  // Booked slots for selectedDate
  const bookedTimes = existingAppointments
    .filter((a) => a.date === selectedDate && a.status !== 'cancelado')
    .map((a) => a.time);

  const blockedTimes = blockedRecord?.specificTimes || [];

  // Generate available slots
  const availableSlots =
    dayConfig.isEnabled && !isDayBlocked
      ? generateSlotsForDay(selectedDate, dayConfig, bookedTimes, blockedTimes)
      : [];

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedTime(''); // reset slot
  };

  // Submit appointment
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !selectedDate || !selectedTime) {
      alert('Por favor, preencha seu nome, telefone e selecione um horário.');
      return;
    }

    setIsSubmitting(true);
    try {
      const appointment: Appointment = {
        id: 'app-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientInstagram: clientInstagram.trim() ? (clientInstagram.startsWith('@') ? clientInstagram : `@${clientInstagram}`) : undefined,
        specialtyId: selectedSpecialty.id,
        specialtyName: selectedSpecialty.name,
        totalPrice: calculateTotalPrice(),
        date: selectedDate,
        time: selectedTime,
        status: 'pendente',
        notes: notes.trim() || undefined,
        selectedAddOns: selectedAddOns.map(
          (id) => availableAddOns.find((a) => a.id === id)?.name || id
        ),
        createdAt: new Date().toISOString(),
      };

      await onBookingComplete(appointment);
      setCompletedAppointment(appointment);
      setCurrentStep(4);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#fbbf24'],
        });
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error(err);
      alert('Houve um erro ao processar seu agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewBooking = () => {
    setCompletedAppointment(null);
    setCurrentStep(1);
    setSelectedTime('');
    setNotes('');
    onResetSelection();
  };

  // Minimum date allowed is today
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section id="agendamento" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Wizard Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-rose-100/90 overflow-hidden">
        {/* Wizard Header with Steps Tracker */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-stone-900 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                Agendamento Online
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight">
                Garanta Seu Horário no Molde F1
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-800/60 border border-rose-400/30 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-6 h-6 text-rose-200" />
            </div>
          </div>

          {/* Progress step indicators */}
          {currentStep < 4 && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-800/60">
              <div
                className={`text-center py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentStep >= 1 ? 'bg-rose-600 text-white font-bold' : 'text-rose-300/60'
                }`}
              >
                1. Procedimento
              </div>
              <div
                className={`text-center py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentStep >= 2 ? 'bg-rose-600 text-white font-bold' : 'text-rose-300/60'
                }`}
              >
                2. Data & Horário
              </div>
              <div
                className={`text-center py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentStep >= 3 ? 'bg-rose-600 text-white font-bold' : 'text-rose-300/60'
                }`}
              >
                3. Seus Dados
              </div>
            </div>
          )}
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: SELECT PROCEDURE & ADD-ONS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">Escolha o Procedimento Desejado</h3>
                <p className="text-sm text-stone-500">
                  Selecione qual especialidade você deseja realizar com Sabrina Lima.
                </p>
              </div>

              {/* Specialties Radio Grid */}
              <div className="space-y-3">
                {specialties.map((item) => {
                  const isSelected = selectedSpecialtyId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedSpecialtyId(item.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/50 shadow-sm'
                          : 'border-stone-200/80 hover:border-rose-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-rose-600 bg-rose-600' : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm sm:text-base">
                              {item.name}
                            </span>
                            {item.isMoldeF1 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                                Molde F1
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                          <span className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            ~{item.durationMinutes} minutos
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-bold font-serif-luxury text-rose-900">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Add-ons */}
              <div className="pt-4 border-t border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-3">
                  Adicionais Opcionais (Nail Art & Joias)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableAddOns.map((addon) => {
                    const isChecked = selectedAddOns.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddOn(addon.id)}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-rose-500 bg-rose-50/70 text-rose-950 font-medium'
                            : 'border-stone-200 text-stone-600 hover:border-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                          <span>{addon.name}</span>
                        </div>
                        <span className="font-semibold text-rose-800">
                          +{formatCurrency(addon.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1 Footer */}
              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500 block">Total estimado:</span>
                  <span className="text-xl font-bold font-serif-luxury text-rose-950">
                    {formatCurrency(calculateTotalPrice())}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>Escolher Data e Horário</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE DATE & AVAILABLE TIME SLOT */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  Selecione o Dia e o Horário Disponível
                </h3>
                <p className="text-sm text-stone-500">
                  Apenas os horários livres e validados pela agenda da Sabrina estão habilitados para garantir seu horário.
                </p>
              </div>

              {/* Selected Procedure reminder badge */}
              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-rose-950">{selectedSpecialty.name}</span>
                  <span className="text-rose-700">({formatCurrency(calculateTotalPrice())})</span>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-rose-700 underline font-medium hover:text-rose-900"
                >
                  Alterar
                </button>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Data do Agendamento
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full p-3.5 pl-11 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-hidden font-medium text-stone-800"
                  />
                  <CalendarIcon className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                </div>

                <p className="text-xs text-stone-500 mt-1.5 flex items-center gap-1 font-medium capitalize">
                  <span>📅 Dia selecionado:</span>
                  <strong className="text-stone-800">
                    {formatDateBR(selectedDate)} ({formatDayOfWeek(selectedDate)})
                  </strong>
                </p>
              </div>

              {/* Availability Status / Time Slots */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Horários Livres da Sabrina
                </label>

                {!dayConfig.isEnabled ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      O Studio não realiza atendimentos aos domingos ou neste dia específico configurado na agenda. Por favor, escolha outra data!
                    </span>
                  </div>
                ) : isDayBlocked ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Data bloqueada pela proprietária: {blockedRecord?.reason || 'Folga ou Feriado'}. Escolha outra data.
                    </span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-stone-600 text-xs space-y-1">
                    <Clock className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                    <p className="font-semibold text-stone-800">Todos os horários deste dia já foram reservados!</p>
                    <p>Por favor, selecione outro dia no calendário acima para encontrar horários livres.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-3 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-900 text-white border-rose-900 shadow-md scale-102'
                              : 'bg-white text-stone-700 border-stone-200 hover:border-rose-400 hover:bg-rose-50/40'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-200' : 'text-stone-400'}`} />
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2 Footer */}
              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  disabled={!selectedTime}
                  onClick={() => setCurrentStep(3)}
                  className={`px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all ${
                    selectedTime
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 cursor-pointer active:scale-95'
                      : 'bg-stone-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Avançar para Seus Dados</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CLIENT DETAILS */}
          {currentStep === 3 && (
            <form onSubmit={handleConfirmBooking} className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-1">Informações para Contato</h3>
                <p className="text-sm text-stone-500">
                  Preencha seus dados para Sabrina Lima registrar seu agendamento no sistema.
                </p>
              </div>

              {/* Order Recap Mini Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between font-bold text-stone-900 text-sm">
                  <span>{selectedSpecialty.name}</span>
                  <span className="text-rose-900">{formatCurrency(calculateTotalPrice())}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-500">
                  <span>📅 {formatDateBR(selectedDate)} ({formatDayOfWeek(selectedDate)})</span>
                  <span>⏰ {selectedTime}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <p className="text-[11px] text-rose-700">
                    + Adicionais: {selectedAddOns.map((id) => availableAddOns.find((a) => a.id === id)?.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Seu Nome Completo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Amanda Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full p-3 pl-10 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-hidden text-sm"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Seu WhatsApp com DDD *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="(11) 99999-9999"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full p-3 pl-10 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-hidden text-sm"
                      />
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Seu Instagram (@) <span className="text-stone-400 font-normal">(opcional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="@seuinstagram"
                        value={clientInstagram}
                        onChange={(e) => setClientInstagram(e.target.value)}
                        className="w-full p-3 pl-10 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-hidden text-sm"
                      />
                      <Instagram className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Observações / Formato / Inspirações <span className="text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      placeholder="Ex: Quero formato bailarina longo igual ao vídeo do catálogo, ou minhas unhas naturais são bem curtinhas."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 pl-10 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-hidden text-sm resize-none"
                    ></textarea>
                    <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              {/* Step 3 Footer */}
              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Salvando Agendamento...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Meu Horário</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: CONFIRMATION & WHATSAPP DIRECT MESSAGE */}
          {currentStep === 4 && completedAppointment && (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Agendamento Registrado com Sucesso!
                </span>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-extrabold text-stone-900 mt-3 mb-2">
                  Pronto, {completedAppointment.clientName}!
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Seu horário foi reservado na agenda de <strong>{studioProfile.name}</strong> ({studioProfile.instagramHandle}).
                </p>
              </div>

              {/* Booking Voucher Card */}
              <div className="bg-rose-50/70 border-2 border-dashed border-rose-300 rounded-3xl p-6 max-w-md mx-auto text-left space-y-3 shadow-xs">
                <div className="flex justify-between items-center border-b border-rose-200/60 pb-3">
                  <span className="text-xs font-mono text-stone-500">CÓDIGO: {completedAppointment.id.slice(-6).toUpperCase()}</span>
                  <span className="text-xs font-bold text-rose-800 bg-rose-200/60 px-2.5 py-0.5 rounded-full">
                    Aguardando Confirmação
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-700">
                  <p><strong>Procedimento:</strong> {completedAppointment.specialtyName}</p>
                  <p><strong>Data:</strong> {formatDateBR(completedAppointment.date)} ({formatDayOfWeek(completedAppointment.date)})</p>
                  <p><strong>Horário:</strong> {completedAppointment.time}</p>
                  <p><strong>Valor:</strong> {formatCurrency(completedAppointment.totalPrice)}</p>
                  <p><strong>Telefone:</strong> {completedAppointment.clientPhone}</p>
                  {completedAppointment.clientInstagram && (
                    <p><strong>Instagram:</strong> {completedAppointment.clientInstagram}</p>
                  )}
                </div>
              </div>

              {/* Direct WhatsApp Confirmation Button */}
              <div className="max-w-md mx-auto space-y-3 pt-2">
                <a
                  href={getWhatsAppUrl(
                    studioProfile.whatsappPhone,
                    generateWhatsAppBookingMessage({
                      clientName: completedAppointment.clientName,
                      clientPhone: completedAppointment.clientPhone,
                      clientInstagram: completedAppointment.clientInstagram,
                      specialtyName: completedAppointment.specialtyName,
                      totalPrice: completedAppointment.totalPrice,
                      date: completedAppointment.date,
                      time: completedAppointment.time,
                      notes: completedAppointment.notes,
                      studioName: studioProfile.name,
                    })
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 active:scale-98"
                >
                  <Send className="w-5 h-5" />
                  <span>Enviar Comprovante no WhatsApp da Sabrina</span>
                </a>

                <p className="text-[11px] text-stone-500">
                  Clique no botão acima para abrir a conversa no WhatsApp da profissional já com todos os detalhes prontos.
                </p>

                <button
                  type="button"
                  onClick={handleStartNewBooking}
                  className="w-full py-2.5 text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
                >
                  Fazer Outro Agendamento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
