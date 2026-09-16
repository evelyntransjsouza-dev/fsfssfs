import React from 'react';
import { Specialty } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Sparkles, Clock, CheckCircle2, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

interface PricingTableProps {
  specialties: Specialty[];
  onSelectSpecialty: (specialty: Specialty) => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ specialties, onSelectSpecialty }) => {
  return (
    <section id="valores" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-rose-50/50 via-white to-rose-50/30 border-y border-rose-100/60">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 text-xs font-bold uppercase tracking-wider mb-4 border border-rose-200">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            Tabela de Valores & Procedimentos
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight mb-4">
            Escolha sua Especialidade
          </h2>
          <p className="text-stone-600 text-base sm:text-lg">
            Valores transparentes para cada procedimento. Todas as aplicações incluem cutilagem especializada, preparação química completa e garantia de durabilidade.
          </p>
        </div>

        {/* Procedures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {specialties.map((item) => (
            <div
              key={item.id}
              className={`relative bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 ${
                item.isFeatured
                  ? 'border-rose-400/80 shadow-lg ring-2 ring-rose-300/40'
                  : 'border-stone-200/80 hover:border-rose-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Highlight ribbon */}
              {item.isFeatured && (
                <div className="absolute -top-3 right-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-md uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Mais Pedido
                  </span>
                </div>
              )}

              <div>
                {/* Category & Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                    {item.category}
                  </span>
                  {item.isMoldeF1 && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Técnica Molde F1
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-stone-900 mb-2 group-hover:text-rose-900 transition-colors">
                  {item.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-stone-600 leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Duration & Info */}
                <div className="flex items-center gap-3 text-xs text-stone-500 mb-6 bg-rose-50/40 p-2.5 rounded-xl border border-rose-100/60">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-rose-600" />
                    Aproximadamente {item.durationMinutes} minutos
                  </span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-stone-400 font-medium block">Valor</span>
                  <span className="text-2xl sm:text-3xl font-bold font-serif-luxury text-rose-950">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectSpecialty(item)}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 group-hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                >
                  <span>Agendar</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quality commitment strip */}
        <div className="bg-white rounded-2xl p-6 border border-rose-100/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Biossegurança Rigorosa</h4>
              <p className="text-xs text-stone-500">Materiais esterilizados em autoclave e descartáveis individuais.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Produtos Importados de Alta Linha</h4>
              <p className="text-xs text-stone-500">Géis e preparadores com máxima aderência e sem descamação.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Garantia de Satisfação</h4>
              <p className="text-xs text-stone-500">Acabamento com curvatura C milimétrica e acabamento fino.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
