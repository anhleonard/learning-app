import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentStatus } from 'src/utils/enums';

export class UpdatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  paymentId: number;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @IsNumber()
  @IsOptional()
  paidAmount: number;

  @IsString()
  @IsOptional()
  paymentNote: string;
}
