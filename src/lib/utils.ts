export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

export function formatDayOfWeek(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', { weekday: 'long' });
}

export function generateWhatsAppBookingMessage(appointment: {
  clientName: string;
  clientPhone: string;
  clientInstagram?: string;
  specialtyName: string;
  totalPrice: number;
  date: string;
  time: string;
  notes?: string;
  studioName: string;
}): string {
  const dataFormatada = formatDateBR(appointment.date);
  const diaSemana = formatDayOfWeek(appointment.date);

  const text = `Olá Sabrina Lima (@sbrnxv_nails)! ✨
Gostaria de confirmar meu agendamento de unhas:

💅 *Procedimento:* ${appointment.specialtyName}
📅 *Data:* ${dataFormatada} (${diaSemana})
⏰ *Horário:* ${appointment.time}
💰 *Valor estimado:* ${formatCurrency(appointment.totalPrice)}
👤 *Cliente:* ${appointment.clientName}
📱 *WhatsApp:* ${appointment.clientPhone}
${appointment.clientInstagram ? `📸 *Instagram:* ${appointment.clientInstagram}\n` : ''}${appointment.notes ? `📝 *Obs:* ${appointment.notes}\n` : ''}
Poderia me confirmar a reserva do horário, por favor? Aguardo seu retorno! 💕`;

  return encodeURIComponent(text);
}

export function getWhatsAppUrl(phone: string, encodedMessage: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateSlotsForDay(
  dateStr: string,
  schedule: {
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
    slotDurationMinutes: number;
  },
  bookedTimes: string[],
  blockedTimes: string[] = []
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const duration = schedule.slotDurationMinutes || 120;

  let breakStartMinutes = -1;
  let breakEndMinutes = -1;
  if (schedule.breakStart && schedule.breakEnd) {
    const [bsh, bsm] = schedule.breakStart.split(':').map(Number);
    const [beh, bem] = schedule.breakEnd.split(':').map(Number);
    breakStartMinutes = bsh * 60 + bsm;
    breakEndMinutes = beh * 60 + bem;
  }

  while (currentMinutes + duration <= endMinutes) {
    // Check if overlaps break time
    const slotEnd = currentMinutes + duration;
    const overlapsBreak =
      breakStartMinutes !== -1 &&
      ((currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) ||
        (slotEnd > breakStartMinutes && slotEnd <= breakEndMinutes));

    if (!overlapsBreak) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      // Check if not already booked or blocked
      if (!bookedTimes.includes(timeString) && !blockedTimes.includes(timeString)) {
        slots.push(timeString);
      }
    }

    // Step by interval (either slot duration or 60 min increments for flexibility)
    currentMinutes += duration >= 120 ? 120 : duration;
  }

  return slots;
}
