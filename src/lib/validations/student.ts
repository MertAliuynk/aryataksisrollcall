import { z } from 'zod';

export const createStudentSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  birthDate: z.date(),
  gender: z.enum(['male', 'female']),
  courseIds: z.array(z.string()).min(1, 'En az bir kurs seçilmelidir'),
});

export const updateStudentSchema = z.object({
  id: z.string(),
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  birthDate: z.date(),
  gender: z.enum(['male', 'female']),
  courseIds: z.array(z.string()).min(1, 'En az bir kurs seçilmelidir'),
});

export const studentFiltersSchema = z.object({
  search: z.string().optional(),
  courseId: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  sortBy: z.enum(['firstName', 'lastName', 'createdAt']).default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentFiltersInput = z.infer<typeof studentFiltersSchema>;