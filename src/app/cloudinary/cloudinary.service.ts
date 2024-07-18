import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary.res';
import { v2 as cloudinary } from 'cloudinary';
import streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (error || !result)
          return reject(error ?? 'Error occured on image upload');

        resolve(result);
      });

      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }
}
