import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsObject,
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';
import { BillingInfoDto } from './paystack.payment.dto';

class OrderItemDTO {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  totalQuantity: number;

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}

class BillingInfoDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}

export class OrderItemDto {
  @IsString() // or @IsUUID() depending on type
  productId: string;

  @IsInt()
  totalQuantity: number;
}

// export class CreateOrderDto {
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => OrderItemDto)
//   orderItems: OrderItemDto[];

//   @ValidateNested()
//   @Type(() => BillingInfoDto)
//   billingInfo: BillingInfoDto;

//   @IsOptional()
//   @IsString()
//   redirect_url?: string;

//   @IsOptional()
//   @IsString()
//   projectDsc?: string;
// }

export class CreateOrderDto {
  orderItems: [{ productId: string; totalQuantity: number }];
  billingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    state: string;
    address: string;
  };
  redirect_url: string;
  projectDsc?: string;
}

// export class CreateOrderDto {
//   @IsNotEmpty()
//   @IsString()
//   redirect_url: string;

//   @IsOptional()
//   @IsString()
//   projectDsc: string;

//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => OrderItemDTO)
//   orderItems: OrderItemDTO[];

//   @IsObject()
//   @ValidateNested()
//   @Type(() => BillingInfoDTO)
//   billingInfo: BillingInfoDTO;
// }
