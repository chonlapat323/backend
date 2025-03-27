import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './admins.dto';
import { Delete, Param, NotFoundException } from '@nestjs/common'; // ⬅️ เพิ่มตรง import ด้านบน
import * as fs from 'fs';
import * as path from 'path';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createAdmin(
    @UploadedFile() avatar: Express.Multer.File | undefined,
    @Body() body: CreateAdminDto,
  ) {
    const avatarUrl = avatar ? `/uploads/${avatar.filename}` : undefined;

    try {
      const newAdmin = await this.adminsService.create(body, avatarUrl);
      return {
        message: '✅ Admin created successfully',
        admin: newAdmin,
      };
    } catch (error) {
      // ❌ ถ้า save admin ไม่สำเร็จ → ลบไฟล์ออก
      if (avatar?.path) {
        const fullPath = path.resolve(avatar.path);
        fs.unlink(fullPath, (err) => {
          if (err) console.error('❌ Failed to remove uploaded file:', err);
        });
      }

      // ✅ ส่ง error กลับ
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const adminId = parseInt(id);
    if (isNaN(adminId)) {
      throw new NotFoundException('Invalid ID');
    }
    return this.adminsService.remove(adminId);
  }
}
