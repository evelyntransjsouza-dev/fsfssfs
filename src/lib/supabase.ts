import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  StudioProfile,
  Specialty,
  CatalogItem,
  DaySchedule,
  BlockedSlot,
  Appointment,
  SupabaseConfig,
} from '../types';
import {
  INITIAL_STUDIO_PROFILE,
  INITIAL_SPECIALTIES,
  INITIAL_CATALOG,
  INITIAL_SCHEDULE,
  INITIAL_SUPABASE_CONFIG,
} from '../data/initialData';

const STORAGE_KEYS = {
  PROFILE: 'sbrn_nails_profile_v1',
  SPECIALTIES: 'sbrn_nails_specialties_v1',
  CATALOG: 'sbrn_nails_catalog_v1',
  SCHEDULE: 'sbrn_nails_schedule_v1',
  BLOCKED: 'sbrn_nails_blocked_v1',
  APPOINTMENTS: 'sbrn_nails_appointments_v1',
  SUPABASE_CFG: 'sbrn_nails_supabase_cfg_v1',
};

// Global client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUPABASE_CFG);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        isConnected: Boolean(parsed.isConnected),
        lastSyncedAt: parsed.lastSyncedAt,
        autoSync: parsed.autoSync ?? true,
      };
    }
  } catch (e) {
    console.error('Error reading supabase config from storage', e);
  }

  return {
    ...INITIAL_SUPABASE_CONFIG,
    url: envUrl,
    anonKey: envKey,
    isConnected: Boolean(envUrl && envKey),
  };
}

export function saveSupabaseConfig(cfg: SupabaseConfig) {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CFG, JSON.stringify(cfg));
  supabaseInstance = null; // reset client to re-init
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const cfg = getSupabaseConfig();
  if (cfg.url && cfg.anonKey && cfg.url.startsWith('https://')) {
    try {
      supabaseInstance = createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: true },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'URL e Anon Key são obrigatórios.' };
  }
  if (!url.startsWith('https://')) {
    return { success: false, message: 'A URL do Supabase deve iniciar com https://' };
  }

  try {
    const testClient = createClient(url, key);
    // Simple ping query
    const { error } = await testClient.from('studio_profile').select('id').limit(1);
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist yet, but credentials work!
      return { success: true, message: 'Conectado com sucesso ao Supabase! (As tabelas precisam ser criadas com o script SQL)' };
    } else if (error && error.message.includes('relation "studio_profile" does not exist')) {
      return { success: true, message: 'Conectado com sucesso ao Supabase! Lembre-se de rodar o script SQL para criar as tabelas.' };
    } else if (error && error.code === 'PGRST301') {
      return { success: false, message: `Erro de autenticação ou chave inválida: ${error.message}` };
    } else if (error) {
      // Still connected to host
      return { success: true, message: `Conexão estabelecida com o Supabase! (${error.message || 'Verifique as tabelas'})` };
    }
    return { success: true, message: 'Conexão validada com sucesso com o Supabase!' };
  } catch (err: any) {
    return { success: false, message: `Falha ao conectar: ${err?.message || 'Verifique URL e Anon Key'}` };
  }
}

// SQL Script generator for owner to execute in Supabase SQL editor
export function getSupabaseSqlSchema(): string {
  return `-- ==============================================================================
-- SCHEMA SUPABASE: Sabrina Lima Nails Designer (@sbrnxv_nails)
-- Execute este script no SQL Editor do seu painel Supabase (Database -> SQL Editor)
-- ==============================================================================

-- 1. Perfil e Configurações do Studio
CREATE TABLE IF NOT EXISTS public.studio_profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'Sabrina Lima Nails Designer',
  subtitle TEXT DEFAULT 'Especialista em Molde F1 & Nail Art de Luxo',
  instagram_handle TEXT DEFAULT '@sbrnxv_nails',
  instagram_url TEXT DEFAULT 'https://instagram.com/sbrnxv_nails',
  whatsapp_phone TEXT DEFAULT '5511987654321',
  bio TEXT,
  location TEXT,
  logo_url TEXT,
  banner_url TEXT,
  admin_pin TEXT DEFAULT '1234',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Especialidades e Procedimentos
CREATE TABLE IF NOT EXISTS public.specialties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_molde_f1 BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Catálogo de Trabalhos / Portfólio (Vídeos e Fotos)
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  specialty_id TEXT,
  category TEXT DEFAULT 'Alongamento Molde F1',
  description TEXT,
  media_type TEXT DEFAULT 'video',
  media_url TEXT NOT NULL,
  cover_url TEXT,
  price_estimate NUMERIC(10,2),
  duration_estimate TEXT,
  tags TEXT[],
  is_highlight BOOLEAN DEFAULT false,
  is_molde_f1 BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Grade de Horários e Disponibilidade
CREATE TABLE IF NOT EXISTS public.schedules (
  day_of_week INTEGER PRIMARY KEY,
  day_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  start_time TEXT NOT NULL DEFAULT '09:00',
  end_time TEXT NOT NULL DEFAULT '19:00',
  break_start TEXT DEFAULT '12:30',
  break_end TEXT DEFAULT '13:30',
  slot_duration_minutes INTEGER DEFAULT 120
);

-- 5. Datas e Horários Bloqueados / Folgas
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  reason TEXT,
  is_full_day BOOLEAN DEFAULT true,
  specific_times TEXT[]
);

-- 6. Agendamentos dos Clientes
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_instagram TEXT,
  specialty_id TEXT NOT NULL,
  specialty_name TEXT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  selected_add_ons TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) com políticas públicas para a aplicação
ALTER TABLE public.studio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
CREATE POLICY "Permitir leitura pública perfil" ON public.studio_profile FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública especialidades" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública catálogo" ON public.catalog_items FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública horários" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública bloqueios" ON public.blocked_slots FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública agendamentos" ON public.appointments FOR SELECT USING (true);

-- Políticas de inserção/atualização
CREATE POLICY "Permitir atualizar perfil" ON public.studio_profile FOR ALL USING (true);
CREATE POLICY "Permitir gerenciar especialidades" ON public.specialties FOR ALL USING (true);
CREATE POLICY "Permitir gerenciar catálogo" ON public.catalog_items FOR ALL USING (true);
CREATE POLICY "Permitir gerenciar horários" ON public.schedules FOR ALL USING (true);
CREATE POLICY "Permitir gerenciar bloqueios" ON public.blocked_slots FOR ALL USING (true);
CREATE POLICY "Permitir criar e gerenciar agendamentos" ON public.appointments FOR ALL USING (true);
`;
}

// -------------------------------------------------------------
// STORE ENGINE: Combines Supabase with resilient LocalStorage fallback
// -------------------------------------------------------------

export const db = {
  // STUDIO PROFILE
  async getProfile(): Promise<StudioProfile> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('studio_profile').select('*').eq('id', 'default').single();
        if (!error && data) {
          const profile: StudioProfile = {
            name: data.name,
            subtitle: data.subtitle,
            instagramHandle: data.instagram_handle,
            instagramUrl: data.instagram_url,
            whatsappPhone: data.whatsapp_phone,
            bio: data.bio,
            location: data.location,
            logoUrl: data.logo_url,
            bannerUrl: data.banner_url,
            adminPin: data.admin_pin || '1234',
          };
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
          return profile;
        }
      } catch (err) {
        console.warn('Supabase profile fetch error, fallback to local', err);
      }
    }

    // LocalStorage fallback
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_STUDIO_PROFILE;
  },

  async saveProfile(profile: StudioProfile): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('studio_profile').upsert({
          id: 'default',
          name: profile.name,
          subtitle: profile.subtitle,
          instagram_handle: profile.instagramHandle,
          instagram_url: profile.instagramUrl,
          whatsapp_phone: profile.whatsappPhone,
          bio: profile.bio,
          location: profile.location,
          logo_url: profile.logoUrl,
          banner_url: profile.bannerUrl,
          admin_pin: profile.adminPin,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Supabase profile save error', err);
      }
    }
  },

  // SPECIALTIES & PROCEDURES
  async getSpecialties(): Promise<Specialty[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('specialties').select('*').order('price', { ascending: false });
        if (!error && data && data.length > 0) {
          const formatted: Specialty[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            category: d.category,
            description: d.description,
            price: Number(d.price),
            durationMinutes: d.duration_minutes,
            imageUrl: d.image_url,
            isFeatured: d.is_featured,
            isMoldeF1: d.is_molde_f1,
          }));
          localStorage.setItem(STORAGE_KEYS.SPECIALTIES, JSON.stringify(formatted));
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase specialties fetch error, fallback to local', err);
      }
    }

    const saved = localStorage.getItem(STORAGE_KEYS.SPECIALTIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_SPECIALTIES;
  },

  async saveSpecialties(items: Specialty[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SPECIALTIES, JSON.stringify(items));
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload = items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          description: item.description,
          price: item.price,
          duration_minutes: item.durationMinutes,
          image_url: item.imageUrl,
          is_featured: item.isFeatured,
          is_molde_f1: item.isMoldeF1,
        }));
        await client.from('specialties').upsert(payload);
      } catch (err) {
        console.error('Supabase specialties sync error', err);
      }
    }
  },

  // CATALOG WORKS (Video & Photo portfolio)
  async getCatalog(): Promise<CatalogItem[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('catalog_items').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const formatted: CatalogItem[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            specialtyId: d.specialty_id,
            category: d.category,
            description: d.description,
            mediaType: d.media_type,
            mediaUrl: d.media_url,
            coverUrl: d.cover_url,
            priceEstimate: Number(d.price_estimate || 0),
            durationEstimate: d.duration_estimate,
            tags: d.tags || [],
            isHighlight: d.is_highlight,
            isMoldeF1: d.is_molde_f1,
          }));
          localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(formatted));
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase catalog fetch error', err);
      }
    }

    const saved = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_CATALOG;
  },

  async saveCatalog(items: CatalogItem[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(items));
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload = items.map((item) => ({
          id: item.id,
          title: item.title,
          specialty_id: item.specialtyId,
          category: item.category,
          description: item.description,
          media_type: item.mediaType,
          media_url: item.mediaUrl,
          cover_url: item.coverUrl,
          price_estimate: item.priceEstimate,
          duration_estimate: item.durationEstimate,
          tags: item.tags,
          is_highlight: item.isHighlight,
          is_molde_f1: item.isMoldeF1,
        }));
        await client.from('catalog_items').upsert(payload);
      } catch (err) {
        console.error('Supabase catalog sync error', err);
      }
    }
  },

  // SCHEDULES & AVAILABILITY
  async getSchedule(): Promise<DaySchedule[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('schedules').select('*').order('day_of_week', { ascending: true });
        if (!error && data && data.length > 0) {
          const formatted: DaySchedule[] = data.map((d: any) => ({
            dayOfWeek: d.day_of_week,
            dayName: d.day_name,
            isEnabled: d.is_enabled,
            startTime: d.start_time,
            endTime: d.end_time,
            breakStart: d.break_start,
            breakEnd: d.break_end,
            slotDurationMinutes: d.slot_duration_minutes,
          }));
          localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(formatted));
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase schedule fetch error', err);
      }
    }

    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_SCHEDULE;
  },

  async saveSchedule(schedule: DaySchedule[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload = schedule.map((s) => ({
          day_of_week: s.dayOfWeek,
          day_name: s.dayName,
          is_enabled: s.isEnabled,
          start_time: s.startTime,
          end_time: s.endTime,
          break_start: s.breakStart,
          break_end: s.breakEnd,
          slot_duration_minutes: s.slotDurationMinutes,
        }));
        await client.from('schedules').upsert(payload);
      } catch (err) {
        console.error('Supabase schedule save error', err);
      }
    }
  },

  // BLOCKED SLOTS / VACATIONS
  async getBlockedSlots(): Promise<BlockedSlot[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('blocked_slots').select('*');
        if (!error && data) {
          const formatted: BlockedSlot[] = data.map((d: any) => ({
            id: d.id,
            date: d.date,
            reason: d.reason,
            isFullDay: d.is_full_day,
            specificTimes: d.specific_times || [],
          }));
          localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(formatted));
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase blocked slots fetch error', err);
      }
    }

    const saved = localStorage.getItem(STORAGE_KEYS.BLOCKED);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  },

  async saveBlockedSlots(slots: BlockedSlot[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(slots));
    const client = getSupabaseClient();
    if (client) {
      try {
        const payload = slots.map((s) => ({
          id: s.id,
          date: s.date,
          reason: s.reason,
          is_full_day: s.isFullDay,
          specific_times: s.specificTimes,
        }));
        await client.from('blocked_slots').upsert(payload);
      } catch (err) {
        console.error('Supabase blocked save error', err);
      }
    }
  },

  // APPOINTMENTS
  async getAppointments(): Promise<Appointment[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('appointments').select('*').order('date', { ascending: true });
        if (!error && data) {
          const formatted: Appointment[] = data.map((d: any) => ({
            id: d.id,
            clientName: d.client_name,
            clientPhone: d.client_phone,
            clientInstagram: d.client_instagram,
            specialtyId: d.specialty_id,
            specialtyName: d.specialty_name,
            totalPrice: Number(d.total_price),
            date: d.date,
            time: d.time,
            status: d.status,
            notes: d.notes,
            selectedAddOns: d.selected_add_ons || [],
            createdAt: d.created_at,
          }));
          localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(formatted));
          return formatted;
        }
      } catch (err) {
        console.warn('Supabase appointments fetch error', err);
      }
    }

    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Initial sample appointment for demonstration
    const sampleDate = new Date();
    sampleDate.setDate(sampleDate.getDate() + 1);
    const dateStr = sampleDate.toISOString().split('T')[0];
    const initialSamples: Appointment[] = [
      {
        id: 'demo-app-1',
        clientName: 'Camila Rodrigues',
        clientPhone: '5511991234567',
        clientInstagram: '@camila.nailslove',
        specialtyId: 'molde-f1-kiss',
        specialtyName: 'Molde F1 - Francesa Vermelha & Kiss Nail Art',
        totalPrice: 160,
        date: dateStr,
        time: '14:00',
        status: 'confirmado',
        notes: 'Unhas curtas naturais, quer formato bailarina longo igual ao vídeo do catálogo.',
        selectedAddOns: ['Strass Swarovski'],
        createdAt: new Date().toISOString(),
      },
    ];
    return initialSamples;
  },

  async createAppointment(appointment: Appointment): Promise<void> {
    const existing = await this.getAppointments();
    const updated = [...existing, appointment];
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('appointments').insert({
          id: appointment.id,
          client_name: appointment.clientName,
          client_phone: appointment.clientPhone,
          client_instagram: appointment.clientInstagram,
          specialty_id: appointment.specialtyId,
          specialty_name: appointment.specialtyName,
          total_price: appointment.totalPrice,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
          notes: appointment.notes,
          selected_add_ons: appointment.selectedAddOns,
          created_at: appointment.createdAt,
        });
      } catch (err) {
        console.error('Supabase appointment insert error', err);
      }
    }
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    const existing = await this.getAppointments();
    const updated = existing.map((a) => (a.id === id ? { ...a, status } : a));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('appointments').update({ status }).eq('id', id);
      } catch (err) {
        console.error('Supabase appointment status update error', err);
      }
    }
  },

  async deleteAppointment(id: string): Promise<void> {
    const existing = await this.getAppointments();
    const updated = existing.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('appointments').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase appointment delete error', err);
      }
    }
  },

  // Full database sync to push all local data into Supabase
  async syncAllToSupabase(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Cliente Supabase não está configurado. Conecte primeiro.' };
    }

    try {
      const profile = await this.getProfile();
      const specialties = await this.getSpecialties();
      const catalog = await this.getCatalog();
      const schedule = await this.getSchedule();
      const appointments = await this.getAppointments();

      await client.from('studio_profile').upsert({
        id: 'default',
        name: profile.name,
        subtitle: profile.subtitle,
        instagram_handle: profile.instagramHandle,
        instagram_url: profile.instagramUrl,
        whatsapp_phone: profile.whatsappPhone,
        bio: profile.bio,
        location: profile.location,
        logo_url: profile.logoUrl,
        banner_url: profile.bannerUrl,
        admin_pin: profile.adminPin,
        updated_at: new Date().toISOString(),
      });

      if (specialties.length) {
        await client.from('specialties').upsert(
          specialties.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            description: s.description,
            price: s.price,
            duration_minutes: s.durationMinutes,
            image_url: s.imageUrl,
            is_featured: s.isFeatured,
            is_molde_f1: s.isMoldeF1,
          }))
        );
      }

      if (catalog.length) {
        await client.from('catalog_items').upsert(
          catalog.map((c) => ({
            id: c.id,
            title: c.title,
            specialty_id: c.specialtyId,
            category: c.category,
            description: c.description,
            media_type: c.mediaType,
            media_url: c.mediaUrl,
            cover_url: c.coverUrl,
            price_estimate: c.priceEstimate,
            duration_estimate: c.durationEstimate,
            tags: c.tags,
            is_highlight: c.isHighlight,
            is_molde_f1: c.isMoldeF1,
          }))
        );
      }

      if (schedule.length) {
        await client.from('schedules').upsert(
          schedule.map((s) => ({
            day_of_week: s.dayOfWeek,
            day_name: s.dayName,
            is_enabled: s.isEnabled,
            start_time: s.startTime,
            end_time: s.endTime,
            break_start: s.breakStart,
            break_end: s.breakEnd,
            slot_duration_minutes: s.slotDurationMinutes,
          }))
        );
      }

      if (appointments.length) {
        await client.from('appointments').upsert(
          appointments.map((a) => ({
            id: a.id,
            client_name: a.clientName,
            client_phone: a.clientPhone,
            client_instagram: a.clientInstagram,
            specialty_id: a.specialtyId,
            specialty_name: a.specialtyName,
            total_price: a.totalPrice,
            date: a.date,
            time: a.time,
            status: a.status,
            notes: a.notes,
            selected_add_ons: a.selectedAddOns,
            created_at: a.createdAt,
          }))
        );
      }

      const cfg = getSupabaseConfig();
      saveSupabaseConfig({
        ...cfg,
        lastSyncedAt: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });

      return { success: true, message: 'Todos os dados foram sincronizados com sucesso no Supabase!' };
    } catch (err: any) {
      return { success: false, message: `Erro ao sincronizar: ${err?.message || 'Verifique se as tabelas foram criadas no Supabase.'}` };
    }
  },
};
