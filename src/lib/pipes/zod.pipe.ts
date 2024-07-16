import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class Zod implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  static create(schema: ZodSchema) {
    return new Zod(schema);
  }

  transform(value: any) {
    const result = this.schema.safeParse(value);

    if (result.error) {
      throw new BadRequestException(result.error.errors?.[0]?.message, {
        cause: result.error.errors?.[0].path,
      });
    }

    return result.data;
  }
}
