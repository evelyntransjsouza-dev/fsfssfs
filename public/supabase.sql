-- ==============================================================================
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
  specialty_id TEXT,
  specialty_name TEXT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  notes TEXT,
  selected_add_ons TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON public.appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- ==============================================================================
-- 7. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY)
-- ==============================================================================
ALTER TABLE public.studio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir Leitura Geral studio_profile" ON public.studio_profile;
DROP POLICY IF EXISTS "Permitir Modificacao studio_profile" ON public.studio_profile;

DROP POLICY IF EXISTS "Permitir Leitura Geral specialties" ON public.specialties;
DROP POLICY IF EXISTS "Permitir Modificacao specialties" ON public.specialties;

DROP POLICY IF EXISTS "Permitir Leitura Geral catalog_items" ON public.catalog_items;
DROP POLICY IF EXISTS "Permitir Modificacao catalog_items" ON public.catalog_items;

DROP POLICY IF EXISTS "Permitir Leitura Geral schedules" ON public.schedules;
DROP POLICY IF EXISTS "Permitir Modificacao schedules" ON public.schedules;

DROP POLICY IF EXISTS "Permitir Leitura Geral blocked_slots" ON public.blocked_slots;
DROP POLICY IF EXISTS "Permitir Modificacao blocked_slots" ON public.blocked_slots;

DROP POLICY IF EXISTS "Permitir Insercao appointments" ON public.appointments;
DROP POLICY IF EXISTS "Permitir Leitura appointments" ON public.appointments;
DROP POLICY IF EXISTS "Permitir Modificacao appointments" ON public.appointments;

-- 7.1. Políticas de Leitura Pública
CREATE POLICY "Permitir Leitura Geral studio_profile" ON public.studio_profile FOR SELECT USING (true);
CREATE POLICY "Permitir Leitura Geral specialties" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Permitir Leitura Geral catalog_items" ON public.catalog_items FOR SELECT USING (true);
CREATE POLICY "Permitir Leitura Geral schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Permitir Leitura Geral blocked_slots" ON public.blocked_slots FOR SELECT USING (true);
CREATE POLICY "Permitir Leitura appointments" ON public.appointments FOR SELECT USING (true);

-- 7.2. Políticas de Gravação
CREATE POLICY "Permitir Modificacao studio_profile" ON public.studio_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir Modificacao specialties" ON public.specialties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir Modificacao catalog_items" ON public.catalog_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir Modificacao schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir Modificacao blocked_slots" ON public.blocked_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir Insercao appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir Modificacao appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. STORAGE (BUCKETS PÚBLICOS & POLÍTICAS DE ARMAZENAMENTO)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'media',
    'media',
    true,
    52428800,
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

DROP POLICY IF EXISTS "Permitir Leitura Publica Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Upload Publico Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Atualizacao Publica Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Deletar Publico Storage" ON storage.objects;

CREATE POLICY "Permitir Leitura Publica Storage"
ON storage.objects FOR SELECT
USING (bucket_id IN ('media', 'nails', 'catalog'));

CREATE POLICY "Permitir Upload Publico Storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('media', 'nails', 'catalog'));

CREATE POLICY "Permitir Atualizacao Publica Storage"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('media', 'nails', 'catalog'))
WITH CHECK (bucket_id IN ('media', 'nails', 'catalog'));

CREATE POLICY "Permitir Deletar Publico Storage"
ON storage.objects FOR DELETE
USING (bucket_id IN ('media', 'nails', 'catalog'));

-- ==============================================================================
-- 9. DADOS INICIAIS (SEED DATA)
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
