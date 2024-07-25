import { Injectable } from '@nestjs/common';
import { CloudinaryResponse, FolderNames } from './cloudinary.res';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: FolderNames = 'avatars',
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          allowed_formats: ['jpg', 'png'],
        },
        (error, result) => {
          if (error || !result)
            return reject(error ?? 'Error occured on image upload');

          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }

  async deleteImage(id: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) return reject(error ?? 'Error occured on image delete');

        resolve(result);
      });
    });
  }
}
