export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: Date;
  isPresent: boolean;
  createdAt: Date;
  student: {
    firstName: string;
    lastName: string;
  };
  course: {
    name: string;
  };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: Date;
  isPresent: boolean;
}

export interface StudentAttendanceHistory {
  studentId: string;
  studentName: string;
  recentAttendances: AttendanceRecord[];
  attendanceRate: number;
}