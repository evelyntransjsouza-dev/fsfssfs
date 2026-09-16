import React, { useState, useRef } from 'react';
import { CatalogItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { saveVideoBlob } from '../../lib/videoStorage';
import { Plus, Trash2, Edit2, Film, Image as ImageIcon, Sparkles, X, Eye, Check, Upload, Play, Video } from 'lucide-react';

interface CatalogManagerProps {
  catalogItems: CatalogItem[];
  onSaveCatalog: (newCatalog: CatalogItem[]) => Promise<void>;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  catalogItems,
  onSaveCatalog,
}) => {
  const [items, setItems] = useState<CatalogItem[]>(catalogItems);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Alongamento Molde F1');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [mediaUrl, setMediaUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [priceEstimate, setPriceEstimate] = useState<number>(160);
  const [durationEstimate, setDurationEstimate] = useState('2h 00min');
  const [tagsInput, setTagsInput] = useState('');
  const [isHighlight, setIsHighlight] = useState(false);
  const [isMoldeF1, setIsMoldeF1] = useState(true);

  const fileMediaInputRef = useRef<HTMLInputElement>(null);
  const fileCoverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaType === 'video' && file.type.startsWith('video/')) {
      setIsUploadingMedia(true);
      try {
        const blobUrl = await saveVideoBlob('cat_video_' + Date.now(), file);
        setMediaUrl(blobUrl);
      } catch (err) {
        console.error(err);
        alert('Erro ao processar o vídeo.');
      } finally {
        setIsUploadingMedia(false);
      }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setMediaUrl(event.target.result);
          if (!coverUrl) setCoverUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCoverUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Alongamento Molde F1');
    setDescription('');
    setMediaType('video');
    setMediaUrl('https://assets.mixkit.co/videos/preview/mixkit-glamorous-woman-showing-manicured-hands-41484-large.mp4');
    setCoverUrl('https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80');
    setPriceEstimate(160);
    setDurationEstimate('2h 00min');
    setTagsInput('Molde F1, Vídeo do Catálogo, Luxo');
    setIsHighlight(false);
    setIsMoldeF1(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description);
    setMediaType(item.mediaType);
    setMediaUrl(item.mediaUrl);
    setCoverUrl(item.coverUrl);
    setPriceEstimate(item.priceEstimate);
    setDurationEstimate(item.durationEstimate);
    setTagsInput(item.tags.join(', '));
    setIsHighlight(Boolean(item.isHighlight));
    setIsMoldeF1(Boolean(item.isMoldeF1));
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let updated: CatalogItem[];
    if (editingItem) {
      updated = items.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              title: title.trim(),
              category,
              description: description.trim(),
              mediaType,
              mediaUrl: mediaUrl.trim(),
              coverUrl: coverUrl.trim() || mediaUrl.trim(),
              priceEstimate: Number(priceEstimate),
              durationEstimate,
              tags: parsedTags,
              isHighlight,
              isMoldeF1,
            }
          : it
      );
    } else {
      const newItem: CatalogItem = {
        id: 'cat-' + Date.now(),
        title: title.trim(),
        category,
        description: description.trim(),
        mediaType,
        mediaUrl: mediaUrl.trim(),
        coverUrl: coverUrl.trim() || mediaUrl.trim(),
        priceEstimate: Number(priceEstimate),
        durationEstimate,
        tags: parsedTags,
        isHighlight,
        isMoldeF1,
      };
      updated = [newItem, ...items];
    }

    setItems(updated);
    await onSaveCatalog(updated);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este trabalho do catálogo?')) return;
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    await onSaveCatalog(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
            Catálogo & Portfólio de Trabalhos
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Cadastre trabalhos adicionais, adicione vídeos de demonstração das unhas Molde F1, fotos e tags de referência.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-900 hover:from-rose-800 hover:to-stone-900 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Trabalho ao Catálogo</span>
        </button>
      </div>

      {/* Grid of Catalog items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-16/10 bg-stone-900 overflow-hidden">
              <img
                src={item.coverUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                {item.mediaType === 'video' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1">
                    <Film className="w-3 h-3" /> Vídeo
                  </span>
                )}
                {item.isHighlight && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Destaque
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                  {item.category}
                </span>
                <h4 className="font-serif-luxury text-base font-bold text-stone-900 mb-1 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-2 mb-2">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">Estimativa</span>
                  <span className="text-base font-bold font-serif-luxury text-rose-950">
                    {formatCurrency(item.priceEstimate)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-900 transition-colors"
                    title="Editar trabalho"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 transition-colors"
                    title="Excluir trabalho"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                {editingItem ? 'Editar Trabalho do Catálogo' : 'Adicionar Novo Trabalho'}
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
                <label className="font-bold block text-stone-700 mb-1">Título do Trabalho *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Molde F1 - Francesa Vermelha & Nail Art Beijos"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-sm focus:border-rose-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block text-stone-700 mb-1">Tipo de Mídia *</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as 'video' | 'image')}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="video">🎥 Vídeo (MP4)</option>
                    <option value="image">🖼️ Foto / Imagem</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block text-stone-700 mb-1">Categoria *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alongamento Molde F1"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold block text-stone-700">
                  Mídia {mediaType === 'video' ? '(Vídeo do Trabalho)' : '(Foto do Trabalho)'} *
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={mediaType === 'video' ? 'Link do vídeo (.mp4 ou URL)' : 'Link da imagem'}
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs"
                  />
                  <input
                    type="file"
                    ref={fileMediaInputRef}
                    accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleMediaFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileMediaInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingMedia ? 'Processando...' : 'Subir Arquivo'}</span>
                  </button>
                </div>

                {/* Media Preview Box */}
                {mediaUrl && (
                  <div className="mt-2 rounded-xl bg-stone-900 overflow-hidden aspect-video relative flex items-center justify-center border border-stone-200">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold block text-stone-700">Imagem de Capa (Thumbnail do Vídeo)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-stone-300 text-xs"
                  />
                  <input
                    type="file"
                    ref={fileCoverInputRef}
                    accept="image/*"
                    onChange={handleCoverFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileCoverInputRef.current?.click()}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Foto</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block text-stone-700 mb-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={priceEstimate}
                    onChange={(e) => setPriceEstimate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-bold text-rose-900"
                  />
                </div>

                <div>
                  <label className="font-bold block text-stone-700 mb-1">Tempo Estimado</label>
                  <input
                    type="text"
                    placeholder="Ex: 2h 00min"
                    value={durationEstimate}
                    onChange={(e) => setDurationEstimate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block text-stone-700 mb-1">Descrição do Trabalho</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes dos materiais, pedrarias, formato das unhas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-sm resize-none"
                ></textarea>
              </div>

              <div>
                <label className="font-bold block text-stone-700 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Molde F1, Francesa Vermelha, Kiss Art, Pedrarias"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHighlight}
                    onChange={(e) => setIsHighlight(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-stone-800">Destacar no Topo do Catálogo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMoldeF1}
                    onChange={(e) => setIsMoldeF1(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="font-semibold text-stone-800">Técnica Molde F1</span>
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
                  Salvar Trabalho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
