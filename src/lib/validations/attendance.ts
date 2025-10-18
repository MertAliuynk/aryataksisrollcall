import { z } from 'zod';

// Attendance Status Enum
export const AttendanceStatusEnum = z.enum(['PRESENT', 'ABSENT', 'EXCUSED']);

export const createAttendanceSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  date: z.date(),
  status: AttendanceStatusEnum,
});

// Backward compatibility için eski schema
export const createAttendanceLegacySchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  date: z.date(),
  isPresent: z.boolean(),
});

export const bulkAttendanceSchema = z.object({
  courseId: z.string(),
  date: z.date(),
  attendances: z.array(z.object({
    studentId: z.string(),
    status: AttendanceStatusEnum,
  })),
});

// Backward compatibility için eski bulk schema
export const bulkAttendanceLegacySchema = z.object({
  courseId: z.string(),
  date: z.date(),
  attendances: z.array(z.object({
    studentId: z.string(),
    isPresent: z.boolean(),
  })),
});

export const attendanceFiltersSchema = z.object({
  studentId: z.string().optional(),
  courseId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: AttendanceStatusEnum.optional(),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type CreateAttendanceLegacyInput = z.infer<typeof createAttendanceLegacySchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type BulkAttendanceLegacyInput = z.infer<typeof bulkAttendanceLegacySchema>;
export type AttendanceFiltersInput = z.infer<typeof attendanceFiltersSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusEnum>;