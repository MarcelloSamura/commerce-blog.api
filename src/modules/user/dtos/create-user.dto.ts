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
  password: stringSchema,
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

  @ApiPropertyOptional({ type: String, description: 'Optional password' })
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
