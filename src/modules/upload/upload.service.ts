import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { CLOUDINARY } from './upload.provider';

@Injectable()
export class UploadService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
  ) {}

  uploadImage(buffer: Buffer, folder: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  uploadMultiple(files: Express.Multer.File[], folder: string): Promise<any[]> {
    return Promise.all(files.map((f) => this.uploadImage(f.buffer, folder)));
  }
}
