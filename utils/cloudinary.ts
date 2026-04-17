export const uploadToCloudinary = async (file: File) => {
  const { public: config } = useRuntimeConfig();

  const CLOUD_NAME = config.cloudinaryCloudName as string;
  const UPLOAD_PRESET = config.cloudinaryUploadPreset as string;
  const API_URL = config.cloudinaryApiUrl as string;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(
      `${API_URL}/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    return {
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error("Upload Cloudinary error:", error);
    throw error;
  }
};