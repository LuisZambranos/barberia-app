import { useState, useEffect } from 'react';
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '../../../core/services/gallery.service';
import { uploadImage } from '../../../core/services/storage.service';
import type { GalleryImage, GalleryType } from '../../../core/models/Gallery';
import { ConfirmModal } from '../shared/ConfirmModal';
import { format, parseISO } from 'date-fns';

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState<GalleryType>('haircut');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [filterType]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await getGalleryImages(filterType);
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Subir a ImgBB
      const url = await uploadImage(file, `gallery_${filterType}`);
      // 2. Guardar en Firestore
      const newImg = await addGalleryImage(url, filterType);
      setImages(prev => [newImg, ...prev]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al subir la imagen");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDeleteClick = (img: GalleryImage) => {
    setImageToDelete(img);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGalleryImage(imageToDelete.id);
      setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
      setDeleteModalOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error("Error eliminando imagen:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Gestión de Galería</h2>

        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {/* Selector de Tipo */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-txt-muted mb-2 uppercase tracking-wider">Categoría</label>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-max">
              <button
                onClick={() => setFilterType('haircut')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'haircut' ? 'bg-gold text-black' : 'text-txt-muted hover:text-white hover:bg-white/5'
                  }`}
              >
                Cortes de Clientes
              </button>
              <button
                onClick={() => setFilterType('local')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'local' ? 'bg-gold text-black' : 'text-txt-muted hover:text-white hover:bg-white/5'
                  }`}
              >
                Fotos del Local
              </button>
            </div>
          </div>

          {/* Subir nueva imagen */}
          <div>
            <label className="block text-sm font-bold text-txt-muted mb-2 uppercase tracking-wider">Subir Nueva Foto</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <div className={`px-6 py-2 bg-gold text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${isUploading ? 'opacity-50' : 'hover:bg-gold-hover shadow-[0_0_15px_rgba(212,175,55,0.3)]'}`}>
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {isUploading ? 'Subiendo...' : 'Seleccionar Imagen'}
              </div>
            </div>
            <p className="text-[10px] text-txt-muted mt-2 text-right">Max 2MB. Formatos JPG/PNG.</p>
          </div>
        </div>

        {/* Grilla de imágenes */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-gold w-8 h-8" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 bg-black/20 border border-dashed border-white/10 rounded-2xl">
            <ImageIcon size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-txt-muted">No hay imágenes en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="group relative aspect-4/5 bg-black/40 rounded-xl overflow-hidden border border-white/5">
                <img src={img.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button
                    onClick={() => handleDeleteClick(img)}
                    className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                    title="Eliminar foto"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-2 bg-linear-to-t from-black/80 to-transparent">
                  <p className="text-[10px] text-white/70">{format(parseISO(img.createdAt), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Eliminar Foto"
        message="¿Estás seguro de que deseas eliminar esta fotografía de la galería? No podrás recuperarla."
        type="danger"
        confirmText="Sí, Eliminar"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
