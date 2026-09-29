import React, { useState, useRef, useEffect } from 'react';
import { StudioProfile, SupabaseConfig } from '../../types';
import { testSupabaseConnection, getSupabaseSqlSchema, db, clearSupabaseConfig } from '../../lib/supabase';
import { saveVideoBlob } from '../../lib/videoStorage';
import {
  Save,
  CheckCircle2,
  Database,
  Instagram,
  Phone,
  Lock,
  Sparkles,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
  RefreshCw,
  Video,
  Upload,
  Play,
  Film,
  Image as ImageIcon,
  Download,
  FileCode,
  HardDrive,
  ShieldCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StudioSettingsProps {
  profile: StudioProfile;
  supabaseConfig: SupabaseConfig;
  onSaveProfile: (newProfile: StudioProfile) => Promise<void>;
  onSaveSupabaseConfig: (newConfig: SupabaseConfig) => Promise<void>;
  onSyncAllToSupabase: () => Promise<{ success: boolean; message: string }>;
}

export const StudioSettings: React.FC<StudioSettingsProps> = ({
  profile,
  supabaseConfig,
  onSaveProfile,
  onSaveSupabaseConfig,
  onSyncAllToSupabase,
}) => {
  // Profile Form State
  const [name, setName] = useState(profile.name);
  const [subtitle, setSubtitle] = useState(profile.subtitle);
  const [instagramHandle, setInstagramHandle] = useState(profile.instagramHandle);
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl);
  const [whatsappPhone, setWhatsappPhone] = useState(profile.whatsappPhone);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl);
  const [adminPin, setAdminPin] = useState(profile.adminPin || '1234');
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState(profile.featuredVideoUrl || '');
  const [featuredVideoTitle, setFeaturedVideoTitle] = useState(profile.featuredVideoTitle || '');
  const [featuredVideoCover, setFeaturedVideoCover] = useState(profile.featuredVideoCover || '');

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadMsg, setVideoUploadMsg] = useState('');
  const [isSavedProfile, setIsSavedProfile] = useState(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsVideoUploading(true);
    setVideoUploadMsg('Enviando arquivo...');
    try {
      // Se o Supabase estiver conectado, envia para o bucket 'media' do Supabase Storage
      if (supabaseConfig.isConnected) {
        const res = await db.uploadFileToStorage(file, 'media', 'videos');
        if (res.url) {
          setFeaturedVideoUrl(res.url);
          setVideoUploadMsg('Vídeo salvo com sucesso no Supabase Storage!');
          setTimeout(() => setVideoUploadMsg(''), 4000);
          return;
        }
      }

      // Fallback para armazenamento em blob IndexedDB local
      const blobUrl = await saveVideoBlob('hero_featured_video', file);
      setFeaturedVideoUrl(blobUrl);
      setVideoUploadMsg('Vídeo salvo com sucesso no navegador!');
      setTimeout(() => setVideoUploadMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setVideoUploadMsg('Erro ao processar arquivo: ' + (err?.message || 'Tente novamente'));
      setTimeout(() => setVideoUploadMsg(''), 5000);
    } finally {
      setIsVideoUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (supabaseConfig.isConnected) {
      try {
        const res = await db.uploadFileToStorage(file, 'media', 'branding');
        if (res.url) {
          setLogoUrl(res.url);
          return;
        }
      } catch (err) {
        console.warn('Erro ao subir logo no Supabase, usando local', err);
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Supabase Config Form State
  const [sbUrl, setSbUrl] = useState(supabaseConfig.url || '');
  const [sbKey, setSbKey] = useState(supabaseConfig.anonKey || '');
  const [isTestingSb, setIsTestingSb] = useState(false);
  const [sbTestResult, setSbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  useEffect(() => {
    setSbUrl(supabaseConfig.url || '');
    setSbKey(supabaseConfig.anonKey || '');
  }, [supabaseConfig.url, supabaseConfig.anonKey]);

  const handleClearSupabase = async () => {
    setSbUrl('');
    setSbKey('');
    setSbTestResult({
      success: true,
      message: 'Chaves, API Key e URL do Supabase foram removidas com sucesso! Tudo limpo para você refazer do zero.',
    });
    const cleared = clearSupabaseConfig();
    await onSaveSupabaseConfig(cleared);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudioProfile = {
      ...profile,
      name: name.trim(),
      subtitle: subtitle.trim(),
      instagramHandle: instagramHandle.trim(),
      instagramUrl: instagramUrl.trim(),
      whatsappPhone: whatsappPhone.trim(),
      bio: bio.trim(),
      location: location.trim(),
      logoUrl: logoUrl.trim(),
      bannerUrl: bannerUrl.trim(),
      adminPin: adminPin.trim() || '1234',
      featuredVideoUrl: featuredVideoUrl.trim(),
      featuredVideoTitle: featuredVideoTitle.trim(),
      featuredVideoCover: featuredVideoCover.trim(),
    };
    await onSaveProfile(updated);
    setIsSavedProfile(true);
    setTimeout(() => setIsSavedProfile(false), 3000);
  };

  const handleTestSupabase = async () => {
    setIsTestingSb(true);
    setSbTestResult(null);
    try {
      const res = await testSupabaseConnection(sbUrl.trim(), sbKey.trim());
      setSbTestResult(res);
      if (res.success) {
        await onSaveSupabaseConfig({
          url: sbUrl.trim(),
          anonKey: sbKey.trim(),
          isConnected: true,
          autoSync: true,
        });

        // Sincronizar automaticamente todo o conteúdo existente para o novo Supabase
        try {
          setIsSyncing(true);
          const syncRes = await onSyncAllToSupabase();
          if (syncRes.success) {
            setSbTestResult({
              success: true,
              message: 'Conectado com sucesso! Dados sincronizados e sistema 100% pronto para salvar novas criações no Supabase.',
            });
          }
        } catch {
          // Mantém o resultado de sucesso da conexão
        } finally {
          setIsSyncing(false);
        }
      }
    } catch (e: any) {
      setSbTestResult({ success: false, message: e?.message || 'Falha ao conectar.' });
    } finally {
      setIsTestingSb(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await onSyncAllToSupabase();
      setSbTestResult(res);
    } catch (e: any) {
      setSbTestResult({ success: false, message: e?.message || 'Erro durante a sincronização.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    const sql = getSupabaseSqlSchema();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadSql = () => {
    const sql = getSupabaseSqlSchema();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'supabase_sabrina_nails.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      {/* 1. STUDIO IDENTITY & BRANDING */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            Identidade do Studio
          </div>
          <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
            Nome do Studio, Logo & Redes Sociais
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Você pode alterar o nome do seu studio, seu logo, Instagram e WhatsApp a qualquer momento.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
          {/* Logo preview & URL */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-rose-400 shadow-md shrink-0 bg-white">
              <img
                src={logoUrl || profile.logoUrl}
                alt="Logo do Studio"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 w-full">
              <label className="font-bold block text-stone-700 mb-1">
                Link da Imagem / Foto do Logo *
              </label>
              <input
                type="url"
                required
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-sm"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Cole o link direto da sua foto de perfil ou logo para atualizar na barra de navegação e rodapé.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block text-stone-700 mb-1">
                Nome do Studio *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 text-sm font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="font-bold block text-stone-700 mb-1">
                Subtítulo / Especialidade
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Especialista em Molde F1"
                className="w-full p-3 rounded-xl border border-stone-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block text-stone-700 mb-1">
                Instagram (@) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@sbrnxv_nails"
                  className="w-full p-3 pl-10 rounded-xl border border-stone-300 text-sm"
                />
                <Instagram className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="font-bold block text-stone-700 mb-1">
                WhatsApp com DDD (para receber agendamentos) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="5511999999999"
                  className="w-full p-3 pl-10 rounded-xl border border-stone-300 text-sm font-mono"
                />
                <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                Formato internacional: 55 + DDD + número (ex: 5511987654321)
              </span>
            </div>
          </div>

          <div>
            <label className="font-bold block text-stone-700 mb-1">
              Biografia / Sobre o Studio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 text-sm resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block text-stone-700 mb-1">
                Localização / Endereço do Atendimento
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Studio Sabrina Lima - Atendimento com hora marcada"
                className="w-full p-3 rounded-xl border border-stone-300 text-sm"
              />
            </div>

            <div>
              <label className="font-bold block text-stone-700 mb-1">
                PIN de Acesso da Proprietária (Senha)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={8}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full p-3 pl-10 rounded-xl border border-stone-300 text-sm font-mono font-bold tracking-widest text-rose-900"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* 🎥 FEATURED REAL VIDEO SECTION */}
          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    Vídeo Oficial do Studio (Catálogo em Destaque)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    O vídeo real das unhas Molde F1 exibido com destaque no topo do site para os clientes.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-rose-800 bg-rose-200/80 px-2.5 py-1 rounded-full">
                Técnica Molde F1
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-7 space-y-3">
                <div>
                  <label className="font-bold block text-stone-700 mb-1">
                    Título / Descrição Curta do Vídeo
                  </label>
                  <input
                    type="text"
                    value={featuredVideoTitle}
                    onChange={(e) => setFeaturedVideoTitle(e.target.value)}
                    placeholder="Ex: Gravação Real do Catálogo: Molde F1 & Desenho das Bratz"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block text-stone-700 mb-1">
                    Link do Vídeo (.mp4 ou URL de vídeo)
                  </label>
                  <input
                    type="text"
                    value={featuredVideoUrl}
                    onChange={(e) => setFeaturedVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs"
                  />
                </div>

                {/* Upload Real Video File from Device */}
                <div>
                  <label className="font-bold block text-stone-700 mb-1">
                    Ou envie o arquivo real de vídeo do seu celular / computador:
                  </label>
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    disabled={isVideoUploading}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-white hover:bg-rose-50 text-rose-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-rose-600" />
                    <span>
                      {isVideoUploading
                        ? 'Processando e salvando vídeo...'
                        : 'Selecionar Vídeo do Celular / Computador (MP4, MOV)'}
                    </span>
                  </button>
                  {videoUploadMsg && (
                    <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {videoUploadMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* Video Preview */}
              <div className="md:col-span-5">
                <label className="font-bold block text-stone-700 mb-1">
                  Prévia do Vídeo Atual
                </label>
                <div className="relative aspect-video rounded-xl bg-stone-900 overflow-hidden shadow-sm flex items-center justify-center">
                  {featuredVideoUrl ? (
                    <video
                      src={featuredVideoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4 text-stone-400">
                      <Film className="w-8 h-8 mx-auto mb-1 text-stone-500" />
                      <p className="text-xs">Nenhum vídeo carregado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            {isSavedProfile ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Alterações salvas com sucesso!
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações do Studio</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. SUPABASE DATABASE CONFIGURATION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Banco de Dados Supabase
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
              Conexão com Banco de Dados Supabase
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Conecte seu projeto Supabase para persistência dos agendamentos, clientes, catálogo e horários na nuvem.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-stone-100 text-stone-600 border border-stone-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                }`}
              ></span>
              {supabaseConfig.isConnected ? 'Supabase Ativo' : 'Armazenamento Local'}
            </span>
          </div>
        </div>

        {/* Credentials Inputs */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold block text-stone-700 mb-1">
              Project URL do Supabase *
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={sbUrl}
              onChange={(e) => setSbUrl(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 font-mono text-sm"
            />
          </div>

          <div>
            <label className="font-bold block text-stone-700 mb-1">
              Anon / Public API Key do Supabase *
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={sbKey}
              onChange={(e) => setSbKey(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 font-mono text-sm"
            />
          </div>

          {/* Test feedback */}
          {sbTestResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                sbTestResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {sbTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{sbTestResult.message}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleTestSupabase}
              disabled={isTestingSb}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSb ? 'animate-spin' : ''}`} />
              <span>{isTestingSb ? 'Testando...' : 'Salvar & Testar Conexão'}</span>
            </button>

            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncing || !sbUrl || !sbKey}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo no Supabase'}</span>
            </button>

            {(sbUrl || sbKey || supabaseConfig.isConnected) && (
              <button
                type="button"
                onClick={handleClearSupabase}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                title="Remover URL e API Key do Supabase para refazer do zero"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Remover Chaves & URL (Limpar Tudo)</span>
              </button>
            )}
          </div>
        </div>

        {/* SQL Script Accordion / Helper */}
        <div className="pt-6 border-t border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-mono font-bold mb-1">
                <FileCode className="w-3.5 h-3.5 text-rose-600" />
                SQL & Tabelas Supabase
              </div>
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <span>Gerador de Script SQL (Pronto para Refazer)</span>
              </h4>
              <p className="text-[11px] text-stone-500">
                Os arquivos SQL anteriores foram removidos do servidor conforme solicitado. Quando estiver pronta para refazer, visualize e copie o script limpo abaixo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSqlViewer(!showSqlViewer)}
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {showSqlViewer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showSqlViewer ? 'Ocultar Script SQL' : 'Visualizar Novo Script SQL'}</span>
              </button>

              {showSqlViewer && (
                <>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-rose-600" />}
                    <span>{copiedSql ? 'Copiado!' : 'Copiar Script SQL'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSql}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                    <span>Baixar Arquivo .sql</span>
                  </button>
                </>
              )}

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Supabase</span>
              </a>
            </div>
          </div>

          {showSqlViewer && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Quick Guide */}
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 text-xs space-y-2">
                <h5 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Como executar no Supabase quando for refazer:
                </h5>
                <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-stone-600 pt-1">
                  <li className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                    <span className="font-bold text-rose-600 block mb-0.5">1. Acesse</span>
                    Entre no seu projeto no <span className="font-semibold text-stone-900">supabase.com</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                    <span className="font-bold text-rose-600 block mb-0.5">2. SQL Editor</span>
                    Clique no menu lateral no ícone <strong>SQL Editor</strong>
                  </li>
                  <li className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                    <span className="font-bold text-rose-600 block mb-0.5">3. Nova Consulta</span>
                    Clique em <strong>+ New query</strong> e cole o SQL abaixo
                  </li>
                  <li className="p-2.5 rounded-xl bg-white/90 border border-rose-100 shadow-2xs">
                    <span className="font-bold text-emerald-600 block mb-0.5">4. Executar</span>
                    Clique no botão verde <strong>Run</strong> (Ctrl+Enter)
                  </li>
                </ol>
                <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[11px] text-stone-600">
                  <span className="font-bold text-stone-700">Tabelas:</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-mono text-[10px]">studio_profile</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-mono text-[10px]">specialties</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-mono text-[10px]">catalog_items</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-mono text-[10px]">schedules</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-mono text-[10px]">blocked_slots</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-mono text-[10px]">appointments</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="font-bold text-stone-700 flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-rose-600" /> Buckets de Armazenamento:
                  </span>
                  <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">storage.media</span>
                  <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">storage.nails</span>
                  <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">storage.catalog</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1 ml-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Políticas de Armazenamento Sem Erro 42501
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="bg-stone-950 rounded-2xl p-4 font-mono text-[11px] text-stone-300 max-h-72 overflow-y-auto border border-stone-800 shadow-inner">
                  <pre className="whitespace-pre-wrap">{getSupabaseSqlSchema()}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
