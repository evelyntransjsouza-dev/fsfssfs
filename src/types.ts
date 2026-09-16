export type ProcedureCategory = 'alongamento' | 'manutencao' | 'nailart' | 'cuidados';

export interface Specialty {
  id: string;
  name: string;
  category: ProcedureCategory;
  description: string;
  price: number; // in BRL (R$)
  durationMinutes: number;
  imageUrl?: string;
  isFeatured?: boolean;
  isMoldeF1?: boolean;
}

export interface CatalogItem {
  id: string;
  title: string;
  specialtyId?: string;
  category: string;
  description: string;
  mediaType: 'video' | 'image';
  mediaUrl: string; // Video URL or Image URL
  coverUrl: string; // Cover thumbnail
  priceEstimate: number;
  durationEstimate: string;
  tags: string[];
  isHighlight?: boolean;
  isMoldeF1?: boolean;
  videoDurationSeconds?: number;
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  dayName: string;
  isEnabled: boolean;
  startTime: string; // "09:00"
  endTime: string; // "19:00"
  breakStart?: string; // "12:00"
  breakEnd?: string; // "13:00"
  slotDurationMinutes: number; // e.g. 120 (2h) or 150 (2h30) for Molde F1
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  isFullDay: boolean;
  specificTimes?: string[]; // ["14:00", "16:00"]
}

export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado';

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientInstagram?: string;
  specialtyId: string;
  specialtyName: string;
  totalPrice: number;
  date: string; // YYYY-MM-DD
  time: string; // "09:00"
  status: AppointmentStatus;
  notes?: string;
  selectedAddOns?: string[];
  createdAt: string;
}

export interface StudioProfile {
  name: string;
  subtitle: string;
  instagramHandle: string; // "@sbrnxv_nails"
  instagramUrl: string;
  whatsappPhone: string; // "5511999999999"
  bio: string;
  location: string;
  logoUrl: string;
  bannerUrl: string;
  adminPin: string; // For owner login (e.g. "1234")
  featuredVideoUrl?: string;
  featuredVideoTitle?: string;
  featuredVideoCover?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  autoSync: boolean;
}
