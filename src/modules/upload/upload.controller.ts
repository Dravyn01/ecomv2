import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('/api')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_, file, cb) => {
        const ext = file.originalname.split('.')[1];
        const allowed = ['jpg', 'jpeg', 'png', 'webp'];

        if (!allowed.includes(ext)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }

        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded or file too large (max 5MB)',
      );
    }

    const result = await this.uploadService.uploadImage(file.buffer, folder);

    return {
      message: 'upload file successfully!',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    };
  }
}
