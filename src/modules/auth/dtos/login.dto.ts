import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import {
  emailStringSchema,
  stringSchema,
} from '../../../shared/schemas.shared';

export const loginSchema = z.object({
  user_email: emailStringSchema,
  password: stringSchema,
});

export type LoginPayload = z.infer<typeof loginSchema>;

export class LoginDTO extends createZodDto(loginSchema) {
  @ApiProperty({
    description: 'The email of the user',
    example: 'marcellosamura@gmail.com',
  })
  user_email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'senha123',
  })
  password: string;
}
