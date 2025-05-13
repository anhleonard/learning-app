import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/utils/enums';

export const Permissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);
