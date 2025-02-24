import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  stringSchema,
  emailStringSchema,
  optionalDateStringSchema,
  optionalUrlStringSchema,
  optionalPhoneNumberStringSchema,
} from '../../../shared/schemas.shared';

export const createUserSchema = z.object({
  user_name: stringSchema,
  user_email: emailStringSchema,
  password: stringSchema
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  phone_number: optionalPhoneNumberStringSchema,
  date_of_birth: optionalDateStringSchema,
  user_photo_url: optionalUrlStringSchema,
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;

export class CreateUserDTO extends createZodDto(createUserSchema) {
  @ApiProperty({ type: String, description: 'User name' })
  user_name: string;

  @ApiProperty({
    type: String,
    description: 'User email',
    example: 'test@gmail.com',
  })
  user_email: string;

  @ApiProperty({
    type: String,
    description:
      'Password (min 8 chars, with uppercase, lowercase, number, and special char)',
    example: 'P@ssw0rd123',
  })
  password: string;

  @ApiPropertyOptional({ type: String, example: '(11) 11111-1111' })
  phone_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'https://photos.com/photo.png',
  })
  user_photo_url?: string;

  @ApiProperty({ type: String, example: '2003-12-09' })
  date_of_birth: string;
}
