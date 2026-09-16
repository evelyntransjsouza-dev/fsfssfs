import React, { useState } from 'react';
import { CatalogItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { MediaModal } from './MediaModal';
import { Play, Sparkles, Clock, Eye, Calendar, Film, Check } from 'lucide-react';

interface CatalogShowcaseProps {
  catalogItems: CatalogItem[];
  onSelectForBooking: (item: CatalogItem) => void;
}

export const CatalogShowcase: React.FC<CatalogShowcaseProps> = ({
  catalogItems,
  onSelectForBooking,
}) => {
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [filter, setFilter] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Trabalhos' },
    { id: 'bratz', label: '💋 Desenho das Bratz (Braites)' },
    { id: 'videos', label: '🎥 Vídeos do Catálogo' },
    { id: 'molde-f1', label: '✨ Molde F1 Destaques' },
    { id: 'luxo', label: '💎 Ouro & Joias 3D' },
    { id: 'francesa', label: '💋 Francesas & Kiss Art' },
  ];

  const filteredItems = catalogItems.filter((item) => {
    if (filter === 'todos') return true;
    if (filter === 'bratz')
      return (
        item.tags.some((t) => t.toLowerCase().includes('bratz') || t.toLowerCase().includes('braite')) ||
        item.title.toLowerCase().includes('bratz') ||
        item.description.toLowerCase().includes('bratz')
      );
    if (filter === 'videos') return item.mediaType === 'video';
    if (filter === 'molde-f1') return item.isMoldeF1;
    if (filter === 'luxo')
      return (
        item.tags.some((t) => t.toLowerCase().includes('ouro') || t.toLowerCase().includes('joias')) ||
        item.title.toLowerCase().includes('ouro')
      );
    if (filter === 'francesa')
      return (
        item.tags.some((t) => t.toLowerCase().includes('francesa') || t.toLowerCase().includes('kiss')) ||
        item.title.toLowerCase().includes('francesa')
      );
    return true;
  });

  return (
    <section id="catalogo" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-4 border border-rose-200 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          Portfólio & Catálogo Oficial em Vídeo
        </div>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-4">
          Arte & Excelência no Molde F1
        </h2>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
          Confira as gravações e produções autorais de <strong>Sabrina Lima</strong>. Unhas esculpidas com curvatura perfeita, acabamento sofisticado e durabilidade extrema.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                filter === cat.id
                  ? 'bg-rose-900 text-white shadow-md scale-105'
                  : 'bg-white text-stone-600 hover:bg-rose-50 border border-stone-200/80 hover:border-rose-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Video Cards Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {filteredItems
          .filter((item) => item.isHighlight)
          .map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              {/* Media Thumbnail Container */}
              <div
                className="relative aspect-video sm:aspect-16/10 bg-stone-900 overflow-hidden cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                />

                {/* Video Play Button Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-rose-600/90 group-hover:bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-xs">
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </div>
                </div>

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/95 text-white text-xs font-bold shadow-md backdrop-blur-xs">
                    <Film className="w-3.5 h-3.5" />
                    Vídeo do Catálogo
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/80 text-rose-200 text-xs font-medium backdrop-blur-xs border border-white/20">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    Molde F1
                  </span>
                </div>

                {/* Duration / Click hint */}
                <div className="absolute bottom-3 right-3 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-md bg-black/75 text-stone-200 text-xs font-mono backdrop-blur-xs flex items-center gap-1">
                    <Eye className="w-3 h-3 text-rose-400" />
                    Ver Detalhes
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      {item.category}
                    </span>
                    <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {item.durationEstimate}
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900 mb-2.5 group-hover:text-rose-900 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-stone-600 leading-relaxed mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Price & Action */}
                <div className="pt-4 border-t border-rose-50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-stone-500 font-medium block">A partir de</span>
                    <span className="text-2xl font-bold font-serif-luxury text-rose-950">
                      {formatCurrency(item.priceEstimate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-rose-400 text-stone-600 hover:text-rose-900 hover:bg-rose-50/50 transition-colors"
                      title="Assistir vídeo do trabalho"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectForBooking(item)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Quero Este Modelo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Grid of Other Works */}
      {filteredItems.filter((item) => !item.isHighlight).length > 0 && (
        <div>
          <h3 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <span>Outras Inspirações do Catálogo</span>
            <span className="w-12 h-0.5 bg-rose-300"></span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems
              .filter((item) => !item.isHighlight)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div
                    className="relative aspect-4/3 bg-stone-900 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-3 py-1.5 rounded-full bg-white/90 text-stone-900 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                        <Eye className="w-3.5 h-3.5 text-rose-600" />
                        Ver Detalhes
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                        {item.category}
                      </span>
                      <h4 className="font-serif-luxury text-lg font-bold text-stone-900 mb-1.5 group-hover:text-rose-800 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-lg font-bold font-serif-luxury text-rose-900">
                        {formatCurrency(item.priceEstimate)}
                      </span>
                      <button
                        onClick={() => onSelectForBooking(item)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 font-semibold text-xs transition-colors"
                      >
                        Agendar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Video & Detail Modal */}
      <MediaModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSelectForBooking={onSelectForBooking}
      />
    </section>
  );
};
