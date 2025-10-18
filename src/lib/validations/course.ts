import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z.string().min(2, 'Kurs adı en az 2 karakter olmalıdır'),
  attendanceDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
    .min(1, 'En az bir yoklama günü seçilmelidir'),
});

export const updateCourseSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Kurs adı en az 2 karakter olmalıdır'),
  attendanceDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
    .min(1, 'En az bir yoklama günü seçilmelidir'),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;