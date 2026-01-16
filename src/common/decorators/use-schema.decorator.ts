import { SetMetadata } from '@nestjs/common';
import { AnyObjectSchema } from 'yup';

export const SCHEMA_METADATA_KEY = 'yup_schema';
export const UseSchema = (schema: AnyObjectSchema) => SetMetadata(SCHEMA_METADATA_KEY, schema);