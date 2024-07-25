import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY_NAME = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY_NAME,
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  },
};
