import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalStringSchema,
  optionalUrlStringSchema,
  optionalEmailStringSchema,
} from '../../../shared/schemas.shared';

export const updateUserSchema = z.object({
  user_name: optionalStringSchema,
  user_email: optionalEmailStringSchema,
  new_password: optionalStringSchema,
  previous_password: optionalStringSchema,
  user_photo_url: optionalUrlStringSchema,
});

export type UpdateUserPayload = z.infer<typeof updateUserSchema>;

export class UpdateUserDTO extends createZodDto(updateUserSchema) {
  @ApiPropertyOptional({ type: String, description: 'Optional user name' })
  user_name?: string;

  @ApiPropertyOptional({ type: String, description: 'Optional user email' })
  user_email?: string;

  @ApiPropertyOptional({ type: String, description: 'Optional new password' })
  new_password?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional previous password',
  })
  previous_password?: string;
}
