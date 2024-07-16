import { z } from 'zod';

export const IdDto = (params?: {
  errorMap?: z.ZodErrorMap;
  invalid_type_error?: string;
  required_error?: string;
  message?: string;
  description?: string;
  invalid_id?: string;
}) => z.string(params).uuid(params?.invalid_id || 'Invalid id');
