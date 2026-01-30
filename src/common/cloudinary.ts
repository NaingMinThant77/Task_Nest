/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({ path: ".env" });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer: Buffer, mimetype: string, folder_name: string) => {
  // Convert Buffer to Base64 with Data URI prefix
  const base64Data = `data:${mimetype};base64,${fileBuffer.toString('base64')}`;
  
  const response = await cloudinary.uploader.upload(base64Data, { 
    folder: folder_name,
    resource_type: 'auto', // Important: allows PDFs and other files
  });

  return {
    url: response.secure_url,
    public_id: response.public_id,
  };
};

const getCloudinaryDetails = (url: string) => {
  const parts = url.split('/');
  
  // 1. Identify the resource type (image, raw, video)
  // Cloudinary URLs look like: .../upload/v1234/folder/name.jpg
  // "raw" files (PDFs) often have 'raw' in the URL segments
  const isRaw = url.includes('/raw/');
  const resourceType = isRaw ? 'raw' : 'image';

  // 2. Extract Public ID
  const lastPart = parts.pop() || ''; // e.g. "name.jpg" or "document.pdf"
  const folder = parts.pop() || '';   // e.g. "profiles" or "tasks"
  const idWithoutExtension = lastPart.split('.')[0];
  
  return {
    publicId: `${folder}/${idWithoutExtension}`,
    resourceType: resourceType as 'image' | 'raw' | 'video'
  };
};

export const deleteFromCloudinary = async (url: string) => {
  try {
    const { publicId, resourceType } = getCloudinaryDetails(url);
    
    // Use the specific resourceType instead of 'auto'
    const res = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType 
    });
    
    return res?.result === "ok";
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return false;
  }
};

