import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import type { GalleryImage, GalleryType } from "../models/Gallery";

export const getGalleryImages = async (type: GalleryType): Promise<GalleryImage[]> => {
  try {
    const q = query(
      collection(db, "gallery"),
      where("type", "==", type)
    );
    const snapshot = await getDocs(q);
    const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
    // Ordenamos en el cliente para evitar requerir un índice compuesto en Firestore
    return images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error(`Error obteniendo imágenes de galería (${type}):`, error);
    throw error;
  }
};

export const addGalleryImage = async (url: string, type: GalleryType): Promise<GalleryImage> => {
  try {
    const newRef = doc(collection(db, "gallery"));
    const newImage: GalleryImage = {
      id: newRef.id,
      url,
      type,
      createdAt: new Date().toISOString()
    };
    await setDoc(newRef, newImage);
    return newImage;
  } catch (error) {
    console.error("Error guardando imagen en Firestore:", error);
    throw error;
  }
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "gallery", id));
  } catch (error) {
    console.error("Error eliminando imagen de galería:", error);
    throw error;
  }
};
