import React, { useState } from 'react';
import { Specialty, ProcedureCategory } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Plus, Edit2, Trash2, Sparkles, Check, Clock, X, DollarSign } from 'lucide-react';

interface SpecialtiesManagerProps {
  specialties: Specialty[];
  onSaveSpecialties: (newSpecialties: Specialty[]) => Promise<void>;
}

export const SpecialtiesManager: React.FC<SpecialtiesManagerProps> = ({
  specialties,
  onSaveSpecialties,
}) => {
  const [items, setItems] = useState<Specialty[]>(specialties);
  const [editingItem, setEditingItem] = useState<Specialty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProcedureCategory>('alongamento');
  const [price, setPrice] = useState<number>(150);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isMoldeF1, setIsMoldeF1] = useState(true);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('alongamento');
    setPrice(150);
    setDurationMinutes(120);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80');
    setIsFeatured(false);
    setIsMoldeF1(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Specialty) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setDurationMinutes(item.durationMinutes);
    setDescription(item.description);
    setImageUrl(item.imageUrl || '');
    setIsFeatured(Boolean(item.isFeatured));
    setIsMoldeF1(Boolean(item.isMoldeF1));
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let updated: Specialty[];
    if (editingItem) {
      updated = items.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              name: name.trim(),
              category,
              price: Number(price),
              durationMinutes: Number(durationMinutes),
              description: description.trim(),
              imageUrl: imageUrl.trim(),
              isFeatured,
              isMoldeF1,
            }
          : it
      );
    } else {
      const newItem: Specialty = {
        id: 'spec-' + Date.now(),
        name: name.trim(),
        category,
        price: Number(price),
        durationMinutes: Number(durationMinutes),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        isFeatured,
        isMoldeF1,
      };
      updated = [newItem, ...items];
    }

    setItems(updated);
    await onSaveSpecialties(updated);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este procedimento?')) return;
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    await onSaveSpecialties(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
            Valores & Especialidades do Studio
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Adicione novas especialidades, ajuste preços em R$, tempo de procedimento e ative a marcação de Molde F1.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-stone-900 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Especialidade</span>
        </button>
      </div>

      {/* Grid of Specialties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>

                <div className="flex items-center gap-1">
                  {item.isMoldeF1 && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                      Molde F1
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-md">
                      Destaque
                    </span>
                  )}
                </div>
              </div>

              <h4 className="font-serif-luxury text-lg font-bold text-stone-900 mb-1">
                {item.name}
              </h4>
              <p className="text-xs text-stone-600 line-clamp-2 mb-3">
                {item.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{item.durationMinutes} minutos</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">Valor Definido</span>
                <span className="text-xl font-bold font-serif-luxury text-rose-950">
                  {formatCurrency(item.price)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-2 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-900 transition-colors"
                  title="Editar especialidade"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 transition-colors"
                  title="Excluir especialidade"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                {editingItem ? 'Editar Especialidade' : 'Cadastrar Nova Especialidade'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block text-stone-700 mb-1">Nome do Procedimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Molde F1 - Francesa Vermelha & Nail Art"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-200 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block text-stone-700 mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProcedureCategory)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="alongamento">Alongamento</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="nailart">Nail Art & Joias</option>
                    <option value="cuidados">Cuidados & Banho</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block text-stone-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={5}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-bold text-rose-900"
                  />
                </div>

                <div>
                  <label className="font-bold block text-stone-700 mb-1">Duração (min) *</label>
                  <input
                    type="number"
                    required
                    min={30}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block text-stone-700 mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  placeholder="Explique os diferenciais deste trabalho, materiais utilizados e recomendações..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-sm resize-none"
                ></textarea>
              </div>

              <div>
                <label className="font-bold block text-stone-700 mb-1">URL da Imagem Ilustrativa</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMoldeF1}
                    onChange={(e) => setIsMoldeF1(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-stone-800">É Técnica Molde F1</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-stone-800">Destacar como Mais Pedido</span>
                </label>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 text-white font-bold shadow-md hover:shadow-lg"
                >
                  Salvar Especialidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
