import { validate } from 'class-validator';

export async function getValidationMessages(dto: object): Promise<string[]> {
  const errors = await validate(dto);
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}
