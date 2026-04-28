import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

const prisma = new PrismaClient();

@Injectable()
export class InventoryService {

  // ── Shared mapper ──────────────────────────────────────────────────────────
  private map(d: any) {
    return {
      id:           d.id,
      name:         d.name,
      category:     d.category                   ?? 'General',
      stock:        Number(d.quantity            ?? 0),
      stockIn:      Number(d.stock_in            ?? 0),
      stockOut:     Number(d.stock_out           ?? 0),
      unit:         d.unit                       ?? 'pcs',
      reorderLevel: Number(d.low_stock_threshold ?? 10),
      price:        Number(d.unit_price          ?? 0),  // unit_price is the only price column now
      createdAt:    d.created_at,
      updatedAt:    d.updated_at,
    };
  }

  // ── CREATE ─────────────────────────────────────────────────────────────────
  async create(dto: CreateInventoryDto) {
    const item = await prisma.inventory_items.create({
      data: {
        name:                dto.name,
        category:            dto.category,
        quantity:            dto.stock        ?? 0,
        stock_in:            dto.stockIn      ?? 0,
        stock_out:           dto.stockOut     ?? 0,
        unit:                dto.unit         ?? 'pcs',
        low_stock_threshold: dto.reorderLevel ?? 10,
        unit_price:          dto.price        ?? 0,   // only unit_price — price column removed
      },
    });
    return this.map(item);
  }

  // ── GET ALL ────────────────────────────────────────────────────────────────
  async findAll() {
    const items = await prisma.inventory_items.findMany({
      orderBy: { name: 'asc' },
    });
    return items.map(i => this.map(i));
  }

  // ── GET ONE ────────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const item = await prisma.inventory_items.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException(`Inventory item ${id} not found`);
    return this.map(item);
  }

  // ── UPDATE STOCK (add / deduct) ────────────────────────────────────────────
  async updateStock(id: string, dto: UpdateInventoryDto) {
    await this.findOne(id);

    const data: any = { updated_at: new Date() };
    if (dto.stock    !== undefined) data.quantity  = dto.stock;
    if (dto.stockIn  !== undefined) data.stock_in  = dto.stockIn;
    if (dto.stockOut !== undefined) data.stock_out = dto.stockOut;

    if (data.quantity < 0) {
      throw new BadRequestException('Stock cannot go below 0');
    }

    const updated = await prisma.inventory_items.update({
      where: { id },
      data,
    });
    return this.map(updated);
  }

  // ── FULL UPDATE ────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateInventoryDto) {
    await this.findOne(id);

    const data: any = { updated_at: new Date() };
    if (dto.name         !== undefined) data.name                = dto.name;
    if (dto.category     !== undefined) data.category            = dto.category;
    if (dto.stock        !== undefined) data.quantity            = dto.stock;
    if (dto.stockIn      !== undefined) data.stock_in            = dto.stockIn;
    if (dto.stockOut     !== undefined) data.stock_out           = dto.stockOut;
    if (dto.unit         !== undefined) data.unit                = dto.unit;
    if (dto.reorderLevel !== undefined) data.low_stock_threshold = dto.reorderLevel;
    if (dto.price        !== undefined) data.unit_price          = dto.price;  // only unit_price — price column removed

    const updated = await prisma.inventory_items.update({
      where: { id },
      data,
    });
    return this.map(updated);
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await prisma.inventory_items.delete({ where: { id } });
    return { message: 'Inventory item deleted successfully' };
  }

  async getMovements(itemId: string) {
    return prisma.stock_movements.findMany({
      where: { item_id: itemId },
      orderBy: { created_at: 'desc' },
    });
  }

  async addMovement(itemId: string, dto: any) {
    return prisma.stock_movements.create({
      data: {
        item_id:   itemId,
        type:      dto.type,
        quantity:  dto.quantity,
        reference: dto.reference ?? null,
        notes:     dto.notes     ?? null,
        by:        dto.by        ?? null,
        date:      dto.date      ? new Date(dto.date) : new Date(),
      },
    });
  }
}
