// src/quote-requests/dto/create-quote-request.dto.ts
//
// This defines exactly what fields the POST /quote-requests endpoint accepts.
// class-validator decorators reject bad data before it reaches your service.
// Requires: npm install class-validator class-transformer (if not already installed)

import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateQuoteRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Contact number is required' })
  contact: string;

  @IsString()
  @IsNotEmpty({ message: 'Vehicle is required' })
  vehicle: string;

  // Maps to the Select values in QuoteForm:
  // "ceramic" | "ppf" | "detailing" | "maintenance" | "combo"
  @IsString()
  @IsNotEmpty({ message: 'Service type is required' })
  service: string;

  // Maps to: "small" | "suv" | "large"
  @IsString()
  @IsNotEmpty({ message: 'Vehicle size is required' })
  size: string;

  // Optional — the Textarea field
  @IsOptional()
  @IsString()
  notes?: string;
}