import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  totalSessions: number;

  @IsNumber()
  @IsNotEmpty()
  totalMonthAmount: number;

  @IsNumber()
  @IsNotEmpty()
  totalPayment: number;

  @IsString()
  @IsOptional()
  paymentNote: string;
}
