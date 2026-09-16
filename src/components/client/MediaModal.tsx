import React, { useRef, useState } from 'react';
import { CatalogItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { X, Play, Pause, Volume2, VolumeX, Sparkles, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface MediaModalProps {
  item: CatalogItem | null;
  onClose: () => void;
  onSelectForBooking: (item: CatalogItem) => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ item, onClose, onSelectForBooking }) => {
  if (!item) return null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col md:flex-row border border-rose-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-lg"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview (Video or Image) */}
        <div className="relative md:w-7/12 bg-stone-950 flex items-center justify-center overflow-hidden min-h-[340px] md:min-h-[500px]">
          {item.mediaType === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={item.mediaUrl}
                poster={item.coverUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="max-h-[540px] w-full object-contain cursor-pointer"
                onClick={togglePlay}
              />

              {/* Video Overlay Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
                <button
                  onClick={togglePlay}
                  className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                  aria-label="Silenciar áudio"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="absolute top-4 left-4 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-semibold backdrop-blur-xs shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  Vídeo do Catálogo Molde F1
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={item.coverUrl || item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover max-h-[540px]"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-semibold backdrop-blur-xs shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  Foto em Alta Resolução
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Details & Action Panel */}
        <div className="p-6 md:p-8 md:w-5/12 flex flex-col justify-between overflow-y-auto max-h-[540px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                {item.category}
              </span>
              {item.isMoldeF1 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Técnica Molde F1
                </span>
              )}
            </div>

            <h3 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-3 tracking-tight">
              {item.title}
            </h3>

            <p className="text-sm text-stone-600 leading-relaxed mb-5">
              {item.description}
            </p>

            {/* Tags */}
            <div className="mb-6">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                Destaques do Design
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 text-rose-500" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Price & Time breakdown */}
            <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500">Investimento estimado:</span>
                <span className="text-2xl font-bold font-serif-luxury text-rose-900">
                  {formatCurrency(item.priceEstimate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Duração aproximada: <strong>{item.durationEstimate}</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <button
              onClick={() => {
                onSelectForBooking(item);
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              Agendar Este Modelo com Sabrina
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              Continuar Olhando o Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
