export class UpdateInventoryDto {
  name?:         string;
  category?:     string;
  stock?:        number;
  stockIn?:      number;
  stockOut?:     number;
  unit?:         string;
  reorderLevel?: number;
  price?:        number;
}