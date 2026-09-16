import React, { useState } from 'react';
import { Sparkles, Calendar, Heart, ShieldCheck, Star, Scissors, Check, Eye } from 'lucide-react';
import { CatalogItem } from '../../types';

interface BratzShowcaseProps {
  onBookNow: (specialtyId?: string) => void;
  onOpenMediaModal?: (item: CatalogItem) => void;
  catalogItems: CatalogItem[];
}

export const BratzShowcase: React.FC<BratzShowcaseProps> = ({
  onBookNow,
  onOpenMediaModal,
  catalogItems,
}) => {
  const [selectedNailIndex, setSelectedNailIndex] = useState(0);

  const sentNails = [
    {
      id: 'molde-f1-kiss',
      title: 'Molde F1 - Francesa Vermelha & Kiss Nail Art',
      subtitle: 'Unhas Enviadas de Referência',
      description:
        'Alongamento esculpido no Molde F1 com francesinha vermelho vibrante, formato bailarina milimétrico, aplicação de strass cristalino na cutícula e nail art de beijinhos.',
      price: 'R$ 160,00',
      duration: '2h 00min',
      image: '/src/assets/images/unha_francesa_kiss_1789087296842.jpg',
      tags: ['Francesa Vermelha', 'Kiss Art', 'Strass', 'Molde F1'],
      specialtyId: 'molde-f1-kiss',
    },
    {
      id: 'molde-f1-ouro-joias',
      title: 'Molde F1 - Coleção Luxo Ouro & Joias 3D',
      subtitle: 'Unhas Enviadas de Referência',
      description:
        'Esmaltação vermelha de luxo, unhas em cromo dourado metálico, laços e espirais em alto relevo 3D e aplicação de clusters de pedrarias preciosas.',
      price: 'R$ 210,00',
      duration: '2h 30min',
      image: '/src/assets/images/unha_ouro_luxo_1789087308562.jpg',
      tags: ['Ouro Chrome', 'Laços 3D', 'Joias', 'Molde F1'],
      specialtyId: 'molde-f1-ouro-joias',
    },
    {
      id: 'molde-f1-bratz',
      title: 'Molde F1 - Nail Art Desenho das Bratz',
      subtitle: 'Arte Exclusiva Sabrina Lima',
      description:
        'Pintura artesanal feita à mão livre com o rostinho das bonecas Bratz, glitter holográfico rosa encapsulado, pedrarias e acabamento vitrificado.',
      price: 'R$ 195,00',
      duration: '2h 30min',
      image: '/src/assets/images/bratz_nail_art_1789086714464.jpg',
      tags: ['Desenho das Bratz', 'Glitter Rosa Y2K', 'Swarovski', 'Molde F1'],
      specialtyId: 'molde-f1-bratz',
    },
  ];

  const currentNail = sentNails[selectedNailIndex];

  return (
    <section id="colecao-bratz" className="py-14 sm:py-20 bg-gradient-to-b from-white via-rose-50/50 to-pink-50/30 border-y border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-900 border border-pink-200 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-pink-600 fill-pink-300" />
            <span>Coleção Especial Bratz & Unhas Molde F1</span>
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-950 tracking-tight leading-tight">
            A Estética das <span className="text-pink-600">Bratz</span> com as{' '}
            <span className="bg-gradient-to-r from-rose-800 to-amber-700 bg-clip-text text-transparent">
              Unhas que Você Enviou
            </span>
          </h2>

          <p className="mt-4 text-stone-600 text-sm sm:text-base leading-relaxed">
            Unimos o visual icônico das bonecas Bratz (glamour Y2K, delineados e muito brilho) com a reprodução
            fiel das unhas Molde F1 de referência de Sabrina Lima (@sbrnxv_nails).
          </p>
        </div>

        {/* Big Dual Banner / Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Left: Bratz Visual Identity Banner */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden bg-stone-900 border border-pink-200 shadow-xl relative group flex flex-col justify-between">
            <div className="relative h-72 sm:h-80 overflow-hidden">
              <img
                src="/src/assets/images/bratz_squad_banner_1789087273250.jpg"
                alt="Estética das Bonecas Bratz"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
              
              {/* Bratz Pill */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-pink-600 text-white font-extrabold text-xs shadow-md">
                  💋 Estética Oficial Bratz
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/60 text-pink-200 backdrop-blur-xs font-semibold text-[11px]">
                  Y2K 2000s Vibe
                </span>
              </div>

              {/* Mini Avatar in Corner */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400 shadow-lg shrink-0">
                  <img
                    src="/src/assets/images/bratz_avatar_1789087284889.jpg"
                    alt="Bratz Doll Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Glamour & Atitude Bratz</h4>
                  <p className="text-pink-200 text-xs">Inspiração visual para unhas com personalidade</p>
                </div>
              </div>
            </div>

            {/* Bratz Characteristics Badges */}
            <div className="p-6 bg-stone-950 text-white flex-1 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="text-stone-200 font-medium">Lábios Marcantes & Gloss</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-stone-200 font-medium">Glitter Rosa & Dourado</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="text-stone-200 font-medium">Pedrarias de Joalheria</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-stone-200 font-medium">Curvatura Molde F1</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span>Inspiração: Yasmin, Cloe, Jade & Sasha</span>
                <span className="text-pink-400 font-bold">Design Sabrina Lima</span>
              </div>
            </div>
          </div>

          {/* Right: The Real Sent Nails Interactive Showcase */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-rose-200 shadow-xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    💅 Unhas Enviadas (Molde F1)
                  </span>
                  <h3 className="font-serif-luxury text-2xl font-bold text-stone-900 mt-2">
                    {currentNail.title}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-lg font-bold text-rose-700 block">{currentNail.price}</span>
                  <span className="text-[11px] text-stone-500">{currentNail.duration}</span>
                </div>
              </div>

              {/* Main Image Display */}
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-stone-900 shadow-inner mb-4 group">
                <img
                  src={currentNail.image}
                  alt={currentNail.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div className="flex flex-wrap gap-1.5">
                    {currentNail.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-black/60 text-rose-200 text-[10px] font-semibold backdrop-blur-xs border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-bold bg-rose-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                    Técnica Molde F1
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                {currentNail.description}
              </p>

              {/* Thumbnail Selector for Sent Nails */}
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                {sentNails.map((nail, index) => {
                  const isSelected = selectedNailIndex === index;
                  return (
                    <button
                      key={nail.id}
                      onClick={() => setSelectedNailIndex(index)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 text-left cursor-pointer ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50 shadow-sm'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden mb-1">
                        <img
                          src={nail.image}
                          alt={nail.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-stone-800 truncate">{nail.title}</p>
                      <p className="text-[9px] text-rose-700 font-semibold">{nail.price}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
              <button
                onClick={() => onBookNow(currentNail.specialtyId)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Este Modelo Enviado ({currentNail.price})</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Columns Cards of the exact Sent Nails */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sentNails.map((nail, idx) => (
            <div
              key={nail.id}
              className="rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-stone-100 group">
                <img
                  src={nail.image}
                  alt={nail.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-rose-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                    Molde F1 Real
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-3 py-1 rounded-full bg-white/95 text-rose-800 font-extrabold text-xs shadow-xs">
                    {nail.price}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm leading-snug">
                    {nail.title}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {nail.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">{nail.duration}</span>
                  <button
                    onClick={() => onBookNow(nail.specialtyId)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Escolher</span>
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
