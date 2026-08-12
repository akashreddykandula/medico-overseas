import api from "../lib/api";

export const uploadImage = async (file, folder) => {
  if (!file) {
    throw new Error("No file selected");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size should be less than 5MB");
  }

  const allowedFolders = [
    "medico-overseas/misc",
    "medico-overseas/blogs",
    "medico-overseas/countries",
    "medico-overseas/universities",
    "medico-overseas/testimonials",
    "medico-overseas/gallery",
  ];

  if (!allowedFolders.includes(folder)) {
    throw new Error("Invalid upload folder");
  }

  const formData = new FormData();

  // IMPORTANT:
  // Backend uses upload.single("file")
  formData.append("file", file);

  const { data } = await api.post(
    `/upload/image?folder=${encodeURIComponent(folder)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  const uploadedUrl = data?.data?.url;

  if (!uploadedUrl) {
    throw new Error("Upload response did not contain an image URL");
  }

  return {
    url: uploadedUrl,
    publicId: data?.data?.publicId,
  };
};
