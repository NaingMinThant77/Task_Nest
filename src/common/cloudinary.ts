/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

dotenv.config({ path: ".env" });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define what the upload function returns
interface CloudinaryResponse {
  url: string;
  public_id: string;
}

export const uploadToCloudinary = async (fileBuffer: Buffer, mimetype: string, folder_name: string): Promise<CloudinaryResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder_name,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result!.secure_url,
          public_id: result!.public_id,
        });
      }
    );

    // Write the buffer to the stream
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
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

