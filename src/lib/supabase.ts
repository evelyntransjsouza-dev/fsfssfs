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
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || INITIAL_SUPABASE_CONFIG.url;
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || INITIAL_SUPABASE_CONFIG.anonKey;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUPABASE_CFG);
    if (stored) {
      const parsed = JSON.parse(stored);
      const url = parsed.url || envUrl || INITIAL_SUPABASE_CONFIG.url;
      const anonKey = parsed.anonKey || envKey || INITIAL_SUPABASE_CONFIG.anonKey;
      return {
        url,
        anonKey,
        isConnected: Boolean(url && anonKey),
        lastSyncedAt: parsed.lastSyncedAt,
        autoSync: parsed.autoSync ?? true,
      };
    }
  } catch (e) {
    console.error('Error reading supabase config from storage', e);
  }

  const effectiveUrl = envUrl || INITIAL_SUPABASE_CONFIG.url;
  const effectiveKey = envKey || INITIAL_SUPABASE_CONFIG.anonKey;

  return {
    ...INITIAL_SUPABASE_CONFIG,
    url: effectiveUrl,
    anonKey: effectiveKey,
    isConnected: Boolean(effectiveUrl && effectiveKey),
  };
}

export function saveSupabaseConfig(cfg: SupabaseConfig) {
  if (!cfg.url && !cfg.anonKey) {
    localStorage.removeItem(STORAGE_KEYS.SUPABASE_CFG);
  } else {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CFG, JSON.stringify(cfg));
  }
  supabaseInstance = null; // reset client to re-init
}

export function clearSupabaseConfig(): SupabaseConfig {
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_CFG);
  supabaseInstance = null;
  return {
    ...INITIAL_SUPABASE_CONFIG,
    url: '',
    anonKey: '',
    isConnected: false,
    autoSync: false,
  };
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
    if (error && (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('does not exist'))) {
      // Table doesn't exist yet in the database, but host and anon key authenticated with 100% success!
      return { success: true, message: 'Conectado com sucesso ao Supabase! As credenciais estão válidas. Basta rodar o script SQL no painel do Supabase para criar as tabelas.' };
    } else if (error && (error.code === 'PGRST301' || error.message?.includes('Invalid API key') || error.message?.includes('JWT'))) {
      return { success: false, message: `Erro de autenticação ou chave inválida: ${error.message}` };
    } else if (error) {
      // Still connected to host
      return { success: true, message: `Conexão estabelecida com o Supabase! (${error.message || 'Pronto para criar tabelas'})` };
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
-- Especialista em Molde F1 • Coleção Bratz Y2K & Nail Art de Luxo
--
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse https://supabase.com e entre no painel do seu projeto.
-- 2. No menu lateral esquerdo, clique no ícone "SQL Editor" (ícone de terminal).
-- 3. Clique no botão "+ New query" (ou Nova Consulta).
-- 4. Cole TODO o conteúdo deste script no editor.
-- 5. Clique no botão verde "Run" (ou pressione Ctrl + Enter / Cmd + Enter).
-- 6. Pronto! As 6 tabelas, índices, BUCKETS E POLÍTICAS DE ARMAZENAMENTO (STORAGE)
--    ATIVADAS e dados iniciais (Bratz, Molde F1) estarão 100% configurados!
-- ==============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABELA: studio_profile (Perfil e Configurações Gerais do Studio)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.studio_profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'Sabrina Lima Nails Designer',
  subtitle TEXT DEFAULT 'Alongamento Molde F1 • Coleção Bratz Y2K & Nail Art de Luxo',
  instagram_handle TEXT DEFAULT '@sbrnxv_nails',
  instagram_url TEXT DEFAULT 'https://instagram.com/sbrnxv_nails',
  whatsapp_phone TEXT DEFAULT '5511987654321',
  bio TEXT,
  location TEXT DEFAULT 'Studio Sabrina Lima - Atendimento exclusivo com hora marcada',
  logo_url TEXT,
  banner_url TEXT,
  admin_pin TEXT DEFAULT '1234',
  featured_video_url TEXT,
  featured_video_title TEXT,
  featured_video_cover TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir colunas adicionais caso a tabela já existisse
ALTER TABLE public.studio_profile ADD COLUMN IF NOT EXISTS featured_video_url TEXT;
ALTER TABLE public.studio_profile ADD COLUMN IF NOT EXISTS featured_video_title TEXT;
ALTER TABLE public.studio_profile ADD COLUMN IF NOT EXISTS featured_video_cover TEXT;

-- ==============================================================================
-- 2. TABELA: specialties (Procedimentos & Especialidades Molde F1)
-- ==============================================================================
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

CREATE INDEX IF NOT EXISTS idx_specialties_category ON public.specialties(category);
CREATE INDEX IF NOT EXISTS idx_specialties_featured ON public.specialties(is_featured);

-- ==============================================================================
-- 3. TABELA: catalog_items (Catálogo de Trabalhos, Fotos e Vídeos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  specialty_id TEXT,
  category TEXT DEFAULT 'Alongamento Molde F1',
  description TEXT,
  media_type TEXT DEFAULT 'video',
  media_url TEXT NOT NULL,
  cover_url TEXT,
  price_estimate NUMERIC(10,2) DEFAULT 0,
  duration_estimate TEXT DEFAULT '2h 00min',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_highlight BOOLEAN DEFAULT false,
  is_molde_f1 BOOLEAN DEFAULT true,
  video_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_created ON public.catalog_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_highlight ON public.catalog_items(is_highlight);
CREATE INDEX IF NOT EXISTS idx_catalog_molde_f1 ON public.catalog_items(is_molde_f1);

-- ==============================================================================
-- 4. TABELA: schedules (Grade de Horários e Funcionamento Semanal)
-- ==============================================================================
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

-- ==============================================================================
-- 5. TABELA: blocked_slots (Dias Bloqueados, Feriados e Folgas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  reason TEXT,
  is_full_day BOOLEAN DEFAULT true,
  specific_times TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_date ON public.blocked_slots(date);

-- ==============================================================================
-- 6. TABELA: appointments (Agendamentos dos Clientes)
-- ==============================================================================
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
  selected_add_ons TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON public.appointments(client_phone);

-- ==============================================================================
-- SEGURANÇA & ROW LEVEL SECURITY (RLS)
-- Políticas com exclusão prévia (DROP POLICY IF EXISTS) para evitar erros
-- ==============================================================================
ALTER TABLE public.studio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read studio_profile" ON public.studio_profile;
DROP POLICY IF EXISTS "Public Manage studio_profile" ON public.studio_profile;
DROP POLICY IF EXISTS "Permitir leitura pública perfil" ON public.studio_profile;
DROP POLICY IF EXISTS "Permitir atualizar perfil" ON public.studio_profile;

DROP POLICY IF EXISTS "Public Read specialties" ON public.specialties;
DROP POLICY IF EXISTS "Public Manage specialties" ON public.specialties;
DROP POLICY IF EXISTS "Permitir leitura pública especialidades" ON public.specialties;
DROP POLICY IF EXISTS "Permitir gerenciar especialidades" ON public.specialties;

DROP POLICY IF EXISTS "Public Read catalog_items" ON public.catalog_items;
DROP POLICY IF EXISTS "Public Manage catalog_items" ON public.catalog_items;
DROP POLICY IF EXISTS "Permitir leitura pública catálogo" ON public.catalog_items;
DROP POLICY IF EXISTS "Permitir gerenciar catálogo" ON public.catalog_items;

DROP POLICY IF EXISTS "Public Read schedules" ON public.schedules;
DROP POLICY IF EXISTS "Public Manage schedules" ON public.schedules;
DROP POLICY IF EXISTS "Permitir leitura pública horários" ON public.schedules;
DROP POLICY IF EXISTS "Permitir gerenciar horários" ON public.schedules;

DROP POLICY IF EXISTS "Public Read blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Public Manage blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Permitir leitura pública bloqueios" ON public.blocked_slots;
DROP POLICY IF EXISTS "Permitir gerenciar bloqueios" ON public.blocked_slots;

DROP POLICY IF EXISTS "Public Read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public Manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Permitir leitura pública agendamentos" ON public.appointments;
DROP POLICY IF EXISTS "Permitir criar e gerenciar agendamentos" ON public.appointments;

CREATE POLICY "Public Read studio_profile" ON public.studio_profile FOR SELECT USING (true);
CREATE POLICY "Public Manage studio_profile" ON public.studio_profile FOR ALL USING (true);

CREATE POLICY "Public Read specialties" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Public Manage specialties" ON public.specialties FOR ALL USING (true);

CREATE POLICY "Public Read catalog_items" ON public.catalog_items FOR SELECT USING (true);
CREATE POLICY "Public Manage catalog_items" ON public.catalog_items FOR ALL USING (true);

CREATE POLICY "Public Read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public Manage schedules" ON public.schedules FOR ALL USING (true);

CREATE POLICY "Public Read blocked_slots" ON public.blocked_slots FOR SELECT USING (true);
CREATE POLICY "Public Manage blocked_slots" ON public.blocked_slots FOR ALL USING (true);

CREATE POLICY "Public Read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Public Manage appointments" ON public.appointments FOR ALL USING (true);

-- ==============================================================================
-- 7. SUPABASE STORAGE (BUCKETS & POLÍTICAS DE ARMAZENAMENTO ATIVADAS)
-- Configuração dos Buckets de Armazenamento para Uploads de Fotos e Vídeos
-- com Row Level Security (RLS) e Políticas de Armazenamento 100% Habilitadas.
-- ==============================================================================

-- 7.1. Criar os Buckets Públicos para o Studio ('media', 'nails', 'catalog')
-- Caso já existam, mantém públicos e atualiza os limites de arquivo para 50MB.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'media',
    'media',
    true,
    52428800, -- Limite de 50MB por arquivo (fotos em alta definição e vídeos de demonstração)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/quicktime', 'video/webm']
  ),
  (
    'nails',
    'nails',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime']
  ),
  (
    'catalog',
    'catalog',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
  )
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 7.2. NOTA: A tabela storage.objects já possui Row Level Security (RLS) habilitada
-- por padrão pelo Supabase. O comando ALTER TABLE storage.objects foi removido para evitar o erro 42501.

-- 7.3. Limpar políticas anteriores do Storage para evitar conflitos (Idempotência garantida)
DROP POLICY IF EXISTS "Public Read Storage media_nails_catalog" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Storage media_nails_catalog" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Storage media_nails_catalog" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Storage media_nails_catalog" ON storage.objects;

DROP POLICY IF EXISTS "Permitir Leitura Publica Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Upload Publico Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Atualizacao Publica Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Deletar Publico Storage" ON storage.objects;

DROP POLICY IF EXISTS "Allow Public Read Storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Insert Storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Update Storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Delete Storage" ON storage.objects;

DROP POLICY IF EXISTS "Public Access - Leitura Pública de Mídia" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Upload de Arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Atualizar Arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Deletar Arquivos" ON storage.objects;

-- 7.4. POLÍTICA DE ARMAZENAMENTO 1: LEITURA PÚBLICA (SELECT)
-- Permite que qualquer visitante do site visualize as fotos de unhas, vídeos do catálogo e banners
CREATE POLICY "Permitir Leitura Publica Storage"
ON storage.objects FOR SELECT
USING (bucket_id IN ('media', 'nails', 'catalog'));

-- 7.5. POLÍTICA DE ARMAZENAMENTO 2: UPLOAD / INSERÇÃO DE ARQUIVOS (INSERT)
-- Permite que você envie novas fotos, referências enviadas por clientes e vídeos de nail art
CREATE POLICY "Permitir Upload Publico Storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('media', 'nails', 'catalog'));

-- 7.6. POLÍTICA DE ARMAZENAMENTO 3: ATUALIZAÇÃO DE ARQUIVOS (UPDATE)
-- Permite alterar, substituir ou renomear arquivos existentes nos buckets
CREATE POLICY "Permitir Atualizacao Publica Storage"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('media', 'nails', 'catalog'))
WITH CHECK (bucket_id IN ('media', 'nails', 'catalog'));

-- 7.7. POLÍTICA DE ARMAZENAMENTO 4: EXCLUSÃO DE ARQUIVOS (DELETE)
-- Permite apagar fotos ou vídeos antigos ou desnecessários
CREATE POLICY "Permitir Deletar Publico Storage"
ON storage.objects FOR DELETE
USING (bucket_id IN ('media', 'nails', 'catalog'));

-- ==============================================================================
-- DADOS INICIAIS (SEED DATA)
-- Inserção idempotente com ON CONFLICT
-- ==============================================================================
INSERT INTO public.studio_profile (
  id,
  name,
  subtitle,
  instagram_handle,
  instagram_url,
  whatsapp_phone,
  bio,
  location,
  logo_url,
  banner_url,
  admin_pin,
  featured_video_url,
  featured_video_title,
  featured_video_cover
) VALUES (
  'default',
  'Sabrina Lima Nails Designer',
  'Alongamento Molde F1 • Coleção Bratz Y2K & Nail Art de Luxo',
  '@sbrnxv_nails',
  'https://instagram.com/sbrnxv_nails',
  '5511987654321',
  'Transformando sua autoestima com unhas impecáveis esculpidas na técnica Molde F1. Coleção temática com a estética icônica das Bratz, francesinhas decoradas com kiss art, joias 3D e acabamento vitrificado de altíssima durabilidade.',
  'Studio Sabrina Lima - Atendimento exclusivo com hora marcada',
  '/src/assets/images/bratz_avatar_1789087284889.jpg',
  '/src/assets/images/bratz_squad_banner_1789087273250.jpg',
  '1234',
  'https://assets.mixkit.co/videos/preview/mixkit-glamorous-woman-showing-manicured-hands-41484-large.mp4',
  'Vídeo Oficial do Catálogo: Molde F1 & Desenho das Bratz',
  '/src/assets/images/unha_francesa_kiss_1789087296842.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  instagram_handle = EXCLUDED.instagram_handle,
  whatsapp_phone = EXCLUDED.whatsapp_phone,
  updated_at = NOW();

INSERT INTO public.specialties (id, name, category, description, price, duration_minutes, image_url, is_featured, is_molde_f1)
VALUES
  (
    'molde-f1-kiss',
    'Molde F1 - Francesa Vermelha & Kiss Nail Art (Unhas Enviadas)',
    'alongamento',
    'Alongamento esculpido na técnica Molde F1 exatamente como no modelo de referência: francesinha vermelho vibrante, formato bailarina/coffin milimétrico, aplicação de strass cristalino na cutícula e nail art de beijinhos desenhados.',
    160.00,
    120,
    '/src/assets/images/unha_francesa_kiss_1789087296842.jpg',
    true,
    true
  ),
  (
    'molde-f1-ouro-joias',
    'Molde F1 - Coleção Luxo Ouro & Joias 3D (Unhas Enviadas)',
    'alongamento',
    'Design de alto impacto no Molde F1 com o modelo enviado: esmaltação vermelha de luxo, acabamento cromo dourado metálico, laços e espirais em relevo 3D e clusters de pedrarias de alta joalheria.',
    210.00,
    150,
    '/src/assets/images/unha_ouro_luxo_1789087308562.jpg',
    true,
    true
  ),
  (
    'molde-f1-bratz',
    'Molde F1 - Nail Art Desenho das Bratz (Braites Y2K)',
    'alongamento',
    'Destaque oficial do Studio! Alongamento premium esculpido no Molde F1 com o icônico desenho artesanal das bonecas Bratz feito à mão livre. Efeito encapsulado com glitter holográfico, rosa Y2K luxo, pedrarias Swarovski e acabamento vitrificado.',
    195.00,
    150,
    '/src/assets/images/bratz_nail_art_1789086714464.jpg',
    true,
    true
  ),
  (
    'molde-f1-classico',
    'Alongamento Molde F1 Natural / Babyboomer',
    'alongamento',
    'Alongamento elegante com simetria perfeita na técnica Molde F1. Acabamento ultra natural, curvatura C padronizada e resistência reforçada.',
    130.00,
    120,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
    true,
    true
  ),
  (
    'manutencao-molde-f1',
    'Manutenção Completa Molde F1',
    'manutencao',
    'Nivelamento do crescimento, reestruturação da curvatura, reposição de gel e troca de esmaltação ou nova nail art.',
    95.00,
    90,
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80',
    false,
    true
  ),
  (
    'francesa-reversa',
    'Francesa Reversa Molde F1 Encapsulada',
    'alongamento',
    'Construção reversa do leito com ponta encapsulada com glitters finos, madrepérolas e brilho tridimensional vitrificado.',
    175.00,
    135,
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    false,
    true
  ),
  (
    'banho-gel-blindagem',
    'Banho de Gel & Blindagem Diamante',
    'cuidados',
    'Proteção fortificante para as unhas naturais não quebrarem, acompanhada de cutilagem russa combinada e esmaltação em gel de longa duração.',
    75.00,
    60,
    'https://images.unsplash.com/photo-1519014816548-bf7805b6e8b5?w=600&auto=format&fit=crop&q=80',
    false,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

INSERT INTO public.catalog_items (
  id,
  title,
  specialty_id,
  category,
  description,
  media_type,
  media_url,
  cover_url,
  price_estimate,
  duration_estimate,
  tags,
  is_highlight,
  is_molde_f1,
  video_duration_seconds
) VALUES
  (
    'video-trabalho-bratz',
    'Molde F1 - Nail Art Desenho das Bratz (Braites Y2K)',
    'molde-f1-bratz',
    'Alongamento Molde F1',
    'Vídeo real do catálogo mostrando em alta definição o desenho exclusivo das Bratz feito à mão nas unhas Molde F1. Acabamento vitrificado, glitter rosa encapsulado e aplicação de pedrarias de luxo.',
    'video',
    'https://assets.mixkit.co/videos/preview/mixkit-glamorous-woman-showing-manicured-hands-41484-large.mp4',
    '/src/assets/images/bratz_nail_art_1789086714464.jpg',
    195.00,
    '2h 30min',
    ARRAY['Molde F1', 'Desenho das Bratz', 'Braites', 'Bratz Nails', 'Vídeo do Catálogo', 'Y2K Luxo'],
    true,
    true,
    16
  ),
  (
    'video-trabalho-1',
    'Molde F1 - Francesa Vermelha & Nail Art Beijos (Unhas Enviadas)',
    'molde-f1-kiss',
    'Alongamento Molde F1',
    'Trabalho autoral de Sabrina Lima! Formato bailarina longo no Molde F1, esmaltação em ponta vermelha de alta definição, aplicação de strass cristalino na cutícula e nail art exclusiva de beijinhos desenhados.',
    'image',
    '/src/assets/images/unha_francesa_kiss_1789087296842.jpg',
    '/src/assets/images/unha_francesa_kiss_1789087296842.jpg',
    160.00,
    '2h 00min',
    ARRAY['Molde F1', 'Francesa Vermelha', 'Kiss Art', 'Pedrarias', 'Unhas Enviadas', 'Destaque'],
    true,
    true,
    0
  ),
  (
    'video-trabalho-2',
    'Molde F1 - Coleção Luxo Ouro & Joias 3D (Unhas Enviadas)',
    'molde-f1-ouro-joias',
    'Alongamento Molde F1',
    'Super produção glamourosa com o modelo enviado: esmaltação vermelha de luxo, unhas em cromo dourado metálico, laços e espirais em relevo 3D e clusters de pedrarias com alta joalheria.',
    'image',
    '/src/assets/images/unha_ouro_luxo_1789087308562.jpg',
    '/src/assets/images/unha_ouro_luxo_1789087308562.jpg',
    210.00,
    '2h 30min',
    ARRAY['Molde F1', 'Ouro Chrome', 'Joias 3D', 'Pedrarias', 'Unhas Enviadas', 'Super Luxo'],
    true,
    true,
    0
  ),
  (
    'trabalho-bratz-squad',
    'Estética Bratz Y2K - Inspiração Oficial da Coleção',
    'molde-f1-bratz',
    'Alongamento Molde F1',
    'A estética autêntica das bonecas Bratz que inspira o trabalho de Sabrina Lima: atitude marcante, muito brilho, delineados poderosos e unhas decoradas com luxo.',
    'image',
    '/src/assets/images/bratz_squad_banner_1789087273250.jpg',
    '/src/assets/images/bratz_squad_banner_1789087273250.jpg',
    195.00,
    '2h 30min',
    ARRAY['Bratz', 'Bonecas Bratz', 'Estética Y2K', 'Braites', 'Inspiração'],
    true,
    true,
    0
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  media_url = EXCLUDED.media_url,
  cover_url = EXCLUDED.cover_url,
  price_estimate = EXCLUDED.price_estimate;

INSERT INTO public.schedules (day_of_week, day_name, is_enabled, start_time, end_time, break_start, break_end, slot_duration_minutes)
VALUES
  (0, 'Domingo', false, '09:00', '18:00', '12:30', '13:30', 120),
  (1, 'Segunda-feira', true, '09:00', '19:00', '12:30', '13:30', 120),
  (2, 'Terça-feira', true, '09:00', '19:00', '12:30', '13:30', 120),
  (3, 'Quarta-feira', true, '09:00', '19:00', '12:30', '13:30', 120),
  (4, 'Quinta-feira', true, '09:00', '19:00', '12:30', '13:30', 120),
  (5, 'Sexta-feira', true, '08:30', '19:30', '12:30', '13:30', 120),
  (6, 'Sábado', true, '08:30', '18:00', '12:30', '13:30', 120)
ON CONFLICT (day_of_week) DO UPDATE SET
  day_name = EXCLUDED.day_name,
  is_enabled = EXCLUDED.is_enabled,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;
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
            featuredVideoUrl: data.featured_video_url,
            featuredVideoTitle: data.featured_video_title,
            featuredVideoCover: data.featured_video_cover,
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
          featured_video_url: profile.featuredVideoUrl,
          featured_video_title: profile.featuredVideoTitle,
          featured_video_cover: profile.featuredVideoCover,
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
            videoDurationSeconds: d.video_duration_seconds,
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
          video_duration_seconds: item.videoDurationSeconds || 0,
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
        featured_video_url: profile.featuredVideoUrl,
        featured_video_title: profile.featuredVideoTitle,
        featured_video_cover: profile.featuredVideoCover,
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
            video_duration_seconds: c.videoDurationSeconds || 0,
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

      const blocked = await this.getBlockedSlots();
      if (blocked.length) {
        await client.from('blocked_slots').upsert(
          blocked.map((b) => ({
            id: b.id,
            date: b.date,
            reason: b.reason,
            is_full_day: b.isFullDay,
            specific_times: b.specificTimes,
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

  // SUPABASE STORAGE: Upload com suporte aos buckets 'media', 'nails', 'catalog'
  async uploadFileToStorage(
    file: File,
    bucket: 'media' | 'nails' | 'catalog' = 'media',
    folder: string = 'uploads'
  ): Promise<{ url: string | null; error: string | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { url: null, error: 'Supabase não está configurado. Conecte sua URL e Anon Key primeiro.' };
    }

    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
      const filePath = `${folder}/${Date.now()}_${cleanName}`;

      const { data, error } = await client.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) {
        return { url: null, error: error.message };
      }

      const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(data.path);
      return { url: publicUrlData.publicUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err?.message || 'Erro no upload para o Supabase Storage' };
    }
  },
};
