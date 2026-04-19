// src/core/services/storage.service.ts

const IMGBB_API_KEY = "7140d37e8484d08573eba92545a6ed38"; 
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB máximo

export const uploadImage = async (file: File, prefix: string = 'img'): Promise<string> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("La imagen es demasiado pesada. El máximo permitido es 2MB.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen válida.");
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("name", `${prefix}_${Date.now()}`); 

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url; 
    } else {
      console.error("Error de ImgBB:", data);
      throw new Error("El servidor de imágenes rechazó el archivo.");
    }
  } catch (error) {
    console.error("Error subiendo foto a ImgBB:", error);
    throw new Error("Ocurrió un error de conexión al subir la imagen.");
  }
};

export const uploadBarberPhoto = async (file: File, barberId: string): Promise<string> => {
  return uploadImage(file, `barber_${barberId}`);
};

export const deleteBarberPhoto = async (photoUrl: string): Promise<void> => {
  console.log("No es necesario borrar de ImgBB. Foto antigua ignorada:", photoUrl);
  return Promise.resolve();
};