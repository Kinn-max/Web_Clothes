export const uploadToCloudinary = async (file: File) => {
  const CLOUD_NAME = "dziuocdnw"; 
  const UPLOAD_PRESET = "luanvan"; 

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();

    return {
      url: data.secure_url,     // link ảnh
      public_id: data.public_id // dùng để xóa ảnh
    };
  } catch (error) {
    console.error("Upload Cloudinary error:", error);
    throw error;
  }
};