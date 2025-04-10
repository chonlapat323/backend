import { Injectable } from '@nestjs/common';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Slide } from './entities/slide.entity';
import { SlideImage } from './entities/slide-image.entity';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class SlidesService {
  constructor(
    @InjectRepository(Slide)
    private readonly slideRepository: Repository<Slide>,

    @InjectRepository(SlideImage)
    private readonly slideImageRepository: Repository<SlideImage>,
  ) {}

  async create(dto: CreateSlideDto) {
    const { imageUrls = [], ...slideData } = dto;
    const imageEntities: SlideImage[] = [];

    if (dto.is_default) {
      await this.slideRepository
        .createQueryBuilder()
        .update()
        .set({ is_default: false })
        .where('is_default = :isDefault', { isDefault: true })
        .execute();
    }

    for (const [index, img] of imageUrls.entries()) {
      let finalUrl = img.url;

      if (img.url.startsWith('/public/temp-uploads/')) {
        const filename = img.url.split('/').pop();
        if (!filename) continue;

        const tempPath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'temp-uploads',
          filename,
        );
        const finalPath = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'uploads',
          'slides',
          filename,
        );

        if (fs.existsSync(tempPath)) {
          fs.renameSync(tempPath, finalPath);
          finalUrl = `/public/uploads/slides/${filename}`;
        }
      }

      const image = this.slideRepository.manager.create(SlideImage, {
        url: finalUrl,
        order_image: index,
      });

      imageEntities.push(image);
    }

    const slide = this.slideRepository.create({
      ...slideData,
      images: imageEntities,
    });

    return this.slideRepository.save(slide);
  }

  // slides.service.ts
  async findAll(page = 1, limit = 10, isActive?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (isActive !== undefined) {
      where.is_active = isActive === 'true';
    }

    const [slides, total] = await this.slideRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { created_at: 'DESC' },
      relations: ['images'],
    });

    return {
      data: slides,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} slide`;
  }

  update(id: number, updateSlideDto: UpdateSlideDto) {
    return `This action updates a #${id} slide`;
  }

  remove(id: number) {
    return `This action removes a #${id} slide`;
  }
}
