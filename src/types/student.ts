import type { Course } from './course';
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'male' | 'female';
  createdAt: Date;
  updatedAt: Date;
  courses: Course[];
}

export interface StudentWithCourses extends Student {
  studentCourses: {
    course: Course;
  }[];
}

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'male' | 'female';
  coursesCount: number;
  courseNames: string[];
}