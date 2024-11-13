import { z } from 'zod';

import { createNullableTransform } from '../utils/create-nullable-transform.util';

/**
 * -----------------------------------------------------------------------------
 * Default Schemas
 * -----------------------------------------------------------------------------
 */
export const numberSchema = z.number().safe('Value is not safe');
export const stringSchema = z.string().trim();
export const emailStringSchema = stringSchema.email();
export const urlStringSchema = stringSchema.url();
export const uuidSchema = stringSchema.uuid();
export const sortSchema = stringSchema
  .regex(/^.+\.(ASC|DESC|asc|desc)$/, 'Formato inválido')
  .transform((val) => val as `${string}.${'ASC' | 'DESC' | 'asc' | 'desc'}`);
export const genderStringSchema = z.enum(['M', 'F']);
export const integerNumberSchema = numberSchema.int();
export const floatNumberSchema = numberSchema
  .refine((val) => !(val % 1 !== 0 || /\.\d+/.test(val.toString())), {
    message: 'Value must be float',
  })
  .transform((value) => parseFloat(String(value)));

export const booleanSchema = z.boolean();

export const stringToNumberSchema = stringSchema
  .refine((value) => !Number.isNaN(+value))
  .transform(Number);

export const stringToIntegerSchema = stringSchema
  .refine(
    (str) => {
      const numberfyedValue = Number(str);

      if (Number.isNaN(numberfyedValue)) return false;

      return Number.isInteger(numberfyedValue);
    },
    { message: 'Value must be int' },
  )
  .transform(Number);

export const stringToFloatSchema = stringSchema
  .refine(
    (str) => {
      const numberfyedValue = Number(str);

      if (Number.isNaN(numberfyedValue)) return false;

      return !(
        numberfyedValue % 1 !== 0 || /\.\d+/.test(numberfyedValue.toString())
      );
    },
    { message: 'Value must be float' },
  )
  .transform((value) => parseFloat(value));

export const paginationParamSchema = z
  .union([stringSchema, integerNumberSchema])
  .refine((value) => !Number.isNaN(+value))
  .transform(Number);

export const booleanStringSchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

export const cpfStringSchema = stringSchema.regex(
  /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
);

export const phoneNumberStringSchema = stringSchema.regex(
  /^\(\d{2}\) \d{5}-\d{4}$/,
);

export const timeStringSchema = stringSchema.time({ precision: 3 });

export const datetimeStringSchema = stringSchema.datetime();

export const dateStringSchema = stringSchema.date();

export const futureDatetimeSchema = datetimeStringSchema.refine(
  (datetime) => {
    const datefyedValue = new Date(datetime);
    const currentDate = new Date();

    // Verifica se a data inserida é posterior à data atual
    return datefyedValue > currentDate;
  },
  { message: 'The date must be in the future' },
);

/**
 * -----------------------------------------------------------------------------
 * Optional Schemas
 * -----------------------------------------------------------------------------
 */
export const optionalEmailStringSchema =
  createNullableTransform(emailStringSchema);

export const optionalStringSchema = createNullableTransform(stringSchema);

export const optionalCpfStringSchema = createNullableTransform(cpfStringSchema);

export const optionalStringToNumberSchema =
  createNullableTransform(stringToNumberSchema);

export const optionalStringSchemaToLowerCase = optionalStringSchema.transform(
  (val) => val?.toLocaleLowerCase(),
);

export const optionalPhoneNumberStringSchema = createNullableTransform(
  phoneNumberStringSchema,
);

export const optionalUuidSchema = createNullableTransform(uuidSchema);

export const optionalUrlStringSchema = createNullableTransform(urlStringSchema);

export const optionalIntegerNumberSchema =
  createNullableTransform(integerNumberSchema);

export const optionalFloatNumberSchema =
  createNullableTransform(floatNumberSchema);

export const optionalPaginationParamSchema = createNullableTransform(
  paginationParamSchema,
);

export const optionalSortSchema = createNullableTransform(sortSchema);

export const optionalTimeStringSchema =
  createNullableTransform(timeStringSchema);

export const optionalDatetimeStringSchema =
  createNullableTransform(datetimeStringSchema);

export const optionalFutureDatetimeSchema =
  createNullableTransform(futureDatetimeSchema);

export const optionalDateStringSchema =
  createNullableTransform(dateStringSchema);

export const optionalBooleanStringSchema =
  createNullableTransform(booleanStringSchema);

export const optionalBooleanSchema = createNullableTransform(booleanSchema);

export const optionalGenderStringSchema =
  createNullableTransform(genderStringSchema);

export const optionalStringToFloatSchema =
  createNullableTransform(stringToFloatSchema);

export const optionalStringToIntegerSchema = createNullableTransform(
  stringToIntegerSchema,
);
