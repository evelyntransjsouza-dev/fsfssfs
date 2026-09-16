import React, { useRef, useState, useEffect } from 'react';
import { StudioProfile, CatalogItem } from '../../types';
import {
  Sparkles,
  Instagram,
  Calendar,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  CheckCircle,
  Video,
  Image as ImageIcon,
  Flame,
  Maximize2,
} from 'lucide-react';
import { saveVideoBlob, getVideoBlobUrl } from '../../lib/videoStorage';

interface ClientHeroProps {
  profile: StudioProfile;
  catalogItems?: CatalogItem[];
  onBookNow: (preSelectedSpecialtyId?: string) => void;
  onExploreCatalog: () => void;
  onOpenMediaModal?: (item: CatalogItem) => void;
}

export const ClientHero: React.FC<ClientHeroProps> = ({
  profile,
  catalogItems = [],
  onBookNow,
  onExploreCatalog,
  onOpenMediaModal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'unhas' | 'bratz' | 'video'>('unhas');
  const [activeNailIndex, setActiveNailIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadUrlInput, setUploadUrlInput] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  const sentNailsList = [
    {
      id: 'molde-f1-kiss',
      title: 'Molde F1 - Francesa Vermelha & Kiss Nail Art',
      badge: 'Unhas Enviadas',
      price: 'R$ 160,00',
      duration: '2h 00min',
      image: '/src/assets/images/unha_francesa_kiss_1789087296842.jpg',
      desc: 'Francesinha vermelho vibrante no formato bailarina perfeito, strass na cutícula e nail art de beijinhos.',
    },
    {
      id: 'molde-f1-ouro-joias',
      title: 'Molde F1 - Coleção Luxo Ouro & Joias 3D',
      badge: 'Unhas Enviadas',
      price: 'R$ 210,00',
      duration: '2h 30min',
      image: '/src/assets/images/unha_ouro_luxo_1789087308562.jpg',
      desc: 'Esmaltação vermelha com cromo dourado espelhado, laços 3D em alto relevo e pedrarias de joalheria.',
    },
    {
      id: 'molde-f1-bratz',
      title: 'Molde F1 - Desenho das Bratz Feito à Mão',
      badge: 'Coleção Bratz',
      price: 'R$ 195,00',
      duration: '2h 30min',
      image: '/src/assets/images/bratz_nail_art_1789086714464.jpg',
      desc: 'Pintura artesanal do rostinho das Bratz à mão livre com glitter rosa holográfico encapsulado.',
    },
  ];

  // Load any previously uploaded video from IndexedDB on mount
  useEffect(() => {
    async function loadSavedVideo() {
      try {
        const savedUrl = await getVideoBlobUrl('hero_featured_video');
        if (savedUrl) {
          setCustomVideoUrl(savedUrl);
        }
      } catch (e) {
        console.warn('Erro ao carregar vídeo salvo:', e);
      }
    }
    loadSavedVideo();
  }, []);

  const currentVideoSrc =
    customVideoUrl ||
    profile.featuredVideoUrl ||
    'https://assets.mixkit.co/videos/preview/mixkit-glamorous-woman-showing-manicured-hands-41484-large.mp4';

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Por favor selecione um arquivo de vídeo (MP4, MOV, WebM, etc).');
      return;
    }

    setIsUploading(true);
    try {
      const blobUrl = await saveVideoBlob('hero_featured_video', file);
      setCustomVideoUrl(blobUrl);
      setIsPlaying(true);
      setActiveTab('video');
      setUploadSuccessMsg('Vídeo real carregado com sucesso!');
      setTimeout(() => {
        setUploadSuccessMsg('');
        setShowUploadModal(false);
      }, 1600);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o vídeo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (!uploadUrlInput.trim()) return;
    setCustomVideoUrl(uploadUrlInput.trim());
    setActiveTab('video');
    setUploadSuccessMsg('Link de vídeo atualizado com sucesso!');
    setTimeout(() => {
      setUploadSuccessMsg('');
      setShowUploadModal(false);
    }, 1400);
  };

  const bratzItem = catalogItems.find(
    (it) => it.id === 'video-trabalho-bratz' || it.title.toLowerCase().includes('bratz')
  );

  return (
    <section id="inicio" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] bg-gradient-to-b from-rose-200/40 via-pink-100/20 to-transparent blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Instagram Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-rose-200/80 shadow-xs backdrop-blur-xs">
              <Instagram className="w-4 h-4 text-rose-600" />
              <a
                href={profile.instagramUrl || `https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-stone-800 hover:text-rose-700 transition-colors"
              >
                {profile.instagramHandle}
              </a>
              <span className="text-stone-300">•</span>
              <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Oficial
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-950 tracking-tight leading-[1.15]">
              Alongamento Perfeito no{' '}
              <span className="bg-gradient-to-r from-rose-800 via-rose-700 to-amber-700 bg-clip-text text-transparent">
                Molde F1
              </span>{' '}
              com Sabrina Lima
            </h1>

            {/* Subheading with Bratz emphasis */}
            <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Especialista no <strong>Molde F1</strong> com curvatura milimétrica, acabamento vitrificado e a exclusiva{' '}
              <strong className="text-rose-900 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Nail Art Desenho das Bratz (Braites Y2K)
              </strong>
              . Assista ao vídeo real do catálogo abaixo e garanta seu horário.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-stone-700 pt-1">
              <span className="flex items-center gap-1.5 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-100">
                <CheckCircle className="w-4 h-4 text-rose-600" />
                Molde F1 Alta Durabilidade
              </span>
              <span className="flex items-center gap-1.5 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-100">
                <Flame className="w-4 h-4 text-rose-600" />
                Desenho das Bratz Artesanal
              </span>
              <span className="flex items-center gap-1.5 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-100">
                <CheckCircle className="w-4 h-4 text-rose-600" />
                Agendamento Garantido no Calendário
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => onBookNow()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 hover:from-rose-800 hover:to-stone-900 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer transform active:scale-98"
                id="btn-hero-agendar"
              >
                <Calendar className="w-5 h-5 text-rose-200" />
                <span>Garantir Meu Horário no Molde F1</span>
              </button>

              <button
                onClick={() => onBookNow('molde-f1-bratz')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-950 font-bold text-sm sm:text-base border-2 border-rose-300 hover:border-rose-400 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="btn-hero-agendar-bratz"
              >
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Agendar Desenho das Bratz</span>
              </button>
            </div>

            {/* User Note for Real Video */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-stone-500">
              <Video className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {customVideoUrl ? (
                  <strong className="text-emerald-700 font-semibold">
                    ✓ Reproduzindo seu vídeo real carregado
                  </strong>
                ) : (
                  <>
                    Você pode trocar o vídeo pelo seu arquivo real a qualquer momento.
                  </>
                )}
              </span>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-rose-700 font-bold underline hover:text-rose-900 cursor-pointer ml-1"
                id="btn-hero-trocar-video"
              >
                {customVideoUrl ? 'Trocar Vídeo' : 'Subir Vídeo Real'}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Video & Bratz Showcase Player */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow */}
              <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-rose-500/25 via-pink-400/20 to-amber-300/20 blur-xl"></div>

              <div className="relative bg-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-rose-100 overflow-hidden">
                {/* Switch Tabs: Unhas Enviadas vs Imagens das Bratz vs Vídeo */}
                <div className="flex items-center justify-between gap-1 p-1 bg-stone-100 rounded-2xl mb-3">
                  <button
                    onClick={() => setActiveTab('unhas')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      activeTab === 'unhas'
                        ? 'bg-rose-700 text-white shadow-sm'
                        : 'text-stone-600 hover:text-rose-700'
                    }`}
                  >
                    <span>💅 Unhas Enviadas</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('bratz')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      activeTab === 'bratz'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'text-stone-600 hover:text-pink-600'
                    }`}
                  >
                    <span>💋 Imagens Bratz</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('video')}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      activeTab === 'video'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Vídeo</span>
                  </button>
                </div>

                {/* Tab 1: Unhas Enviadas (User Reference Nails) */}
                {activeTab === 'unhas' && (
                  <div className="space-y-3">
                    <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-stone-950 shadow-inner group">
                      <img
                        src={sentNailsList[activeNailIndex].image}
                        alt={sentNailsList[activeNailIndex].title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-transparent to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-700 text-white text-xs font-extrabold shadow-md">
                          ✓ {sentNailsList[activeNailIndex].badge}
                        </span>
                        <span className="text-xs font-bold bg-black/70 text-rose-200 px-2.5 py-1 rounded-full backdrop-blur-xs">
                          Molde F1
                        </span>
                      </div>

                      {/* Bottom Info & Booking */}
                      <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300">
                          Modelo Esculpido por Sabrina Lima
                        </span>
                        <h4 className="text-base font-bold text-white mb-1">
                          {sentNailsList[activeNailIndex].title}
                        </h4>
                        <p className="text-xs text-stone-300 line-clamp-2 mb-3">
                          {sentNailsList[activeNailIndex].desc}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onBookNow(sentNailsList[activeNailIndex].id)}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Agendar Este Modelo ({sentNailsList[activeNailIndex].price})</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mini Nail Switcher */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {sentNailsList.map((nail, idx) => (
                        <button
                          key={nail.id}
                          onClick={() => setActiveNailIndex(idx)}
                          className={`p-1.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeNailIndex === idx
                              ? 'border-rose-600 bg-rose-50/80 ring-1 ring-rose-500'
                              : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <img
                            src={nail.image}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover shrink-0"
                          />
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-stone-800 truncate">
                              {idx === 0 ? 'Francesa Kiss' : idx === 1 ? 'Ouro & Joias' : 'Arte Bratz'}
                            </p>
                            <p className="text-[9px] text-rose-700 font-semibold">{nail.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2: Imagens das Bratz (Estética Y2K) */}
                {activeTab === 'bratz' && (
                  <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-pink-950 shadow-inner group">
                    <img
                      src="/src/assets/images/bratz_squad_banner_1789087273250.jpg"
                      alt="Imagens das Bonecas Bratz"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-600 text-white text-xs font-extrabold shadow-md">
                        💋 Imagens Oficiais Bratz
                      </span>

                      <span className="text-xs font-extrabold bg-stone-900/80 text-pink-300 px-2.5 py-1 rounded-full backdrop-blur-xs">
                        Y2K Glam
                      </span>
                    </div>

                    {/* Avatar Pin */}
                    <div className="absolute top-12 left-3 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full border-2 border-pink-400 overflow-hidden shadow-lg">
                        <img
                          src="/src/assets/images/bratz_avatar_1789087284889.jpg"
                          alt="Bratz Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-pink-100 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Yasmin • Cloe • Jade • Sasha
                      </span>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400">
                        Inspiração & Atitude
                      </span>
                      <h4 className="text-base font-bold text-white mb-1">
                        Estética das Bonecas Bratz
                      </h4>
                      <p className="text-xs text-stone-300 line-clamp-2 mb-3">
                        O estilo inconfundível dos anos 2000 que inspira as unhas decoradas do Studio Sabrina Lima.
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('unhas');
                            setActiveNailIndex(2);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Ver as Unhas com Desenho Bratz</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Real Video Player */}
                {activeTab === 'video' && (
                  <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-stone-950 shadow-inner group">
                    <video
                      ref={videoRef}
                      src={currentVideoSrc}
                      poster={profile.featuredVideoCover || profile.bannerUrl}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={togglePlay}
                    />

                    {/* Top Overlay Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-700/90 text-white text-xs font-bold backdrop-blur-xs shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Gravação Real em Vídeo
                      </span>

                      <span className="text-[11px] font-mono bg-black/70 text-white px-2.5 py-1 rounded-full backdrop-blur-xs font-bold">
                        Molde F1
                      </span>
                    </div>

                    {/* Interactive Video Controls Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/95 via-stone-950/60 to-transparent p-4 flex flex-col justify-end text-white">
                      <div className="mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300">
                          Catálogo Oficial Sabrina Lima
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {profile.featuredVideoTitle || 'Alongamento Molde F1 com Esmaltação e Nail Art'}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlay}
                            className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
                            aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 fill-white translate-x-0.5" />
                            )}
                          </button>

                          <button
                            onClick={toggleMute}
                            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-xs cursor-pointer"
                            aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Carregar seu arquivo real de vídeo"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Enviar Vídeo</span>
                          </button>

                          {bratzItem && onOpenMediaModal && (
                            <button
                              onClick={() => onOpenMediaModal(bratzItem)}
                              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                              title="Expandir vídeo"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Studio Live Availability Bar */}
                <div className="pt-3 px-2 flex items-center justify-between text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="font-semibold text-stone-800">Agenda Aberta Esta Semana</span>
                  </div>
                  <span className="text-rose-700 font-bold">{profile.instagramHandle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Video Upload / Link Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-rose-100 text-stone-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                    Carregar Vídeo Real do Catálogo
                  </h3>
                  <p className="text-xs text-stone-500">
                    Use o vídeo gravado do seu celular ou link direto
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {/* Option A: Direct File Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  1. Selecionar Arquivo do Celular ou Computador (MP4, MOV, WebM)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="real-video-file-input"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-50 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-rose-950">
                    {isUploading ? 'Carregando vídeo...' : 'Clique para escolher ou arraste o vídeo aqui'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Grave do Instagram, câmera ou galeria do seu celular
                  </p>
                </div>
              </div>

              {/* Option B: Video Link */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  2. Ou cole o Link Direto do Vídeo (.mp4 ou URL pública)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://meusite.com/meu-video.mp4"
                    value={uploadUrlInput}
                    onChange={(e) => setUploadUrlInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs outline-hidden focus:border-rose-600"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Armazenado com segurança no seu navegador</span>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
