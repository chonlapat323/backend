// src/products/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Variant } from './variant.entity';
import { Tag } from './tag.entity';
import { ProductImage } from './product-image.entity';
import { Category } from 'src/categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL', // ถ้า category ถูกลบ ไม่ให้ลบ product ทิ้ง
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountPrice: number;

  @Column()
  stock: number;

  @Column()
  sku: string;

  @Column()
  brand: string;

  @OneToMany(() => Variant, (variant) => variant.product, { cascade: true })
  variants: Variant[];

  @ManyToMany(() => Tag, (tag) => tag.products, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @Column({ default: 0 })
  soldCount: number;

  @Column({ nullable: true, type: 'text' })
  additionalInformation: string;

  @Column({ nullable: true, type: 'text' })
  design: string;

  // เพิ่มใน Product entity
  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_best_seller: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
