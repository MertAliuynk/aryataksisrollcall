export interface Course {
  id: string;
  name: string;
  attendanceDays: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseWithStudentCount extends Course {
  studentCount: number;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';