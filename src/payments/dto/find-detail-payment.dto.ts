import { IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';

export class FindDetailPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  paymentId: number;

  @ValidateIf(
    (o) => o.learningYear !== undefined || o.learningMonth !== undefined,
  )
  @IsNumber()
  learningMonth?: number;

  @ValidateIf(
    (o) => o.learningMonth !== undefined || o.learningYear !== undefined,
  )
  @IsNumber()
  learningYear?: number;
}
