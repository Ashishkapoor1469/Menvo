import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller({ path: 'upload', version: '1' })
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    // MIME type validation
    if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp|avif)$/)) {
      throw new BadRequestException('Invalid file type');
    }

    // Size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File is too large! Max 5MB allowed.');
    }

    const result = await this.cloudinaryService.uploadImage(file);
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  @Delete(':publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    if (!publicId) throw new BadRequestException('Missing publicId');
    const result = await this.cloudinaryService.deleteImage(publicId);
    return { success: true, result };
  }
}
