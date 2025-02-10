import { Role } from 'src/utils/enums';

export type TokenPayload = {
  userId: number;
  email: string;
  role: string;
};
