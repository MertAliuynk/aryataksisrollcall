import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../db';

export const attendanceRouter = createTRPCRouter({
  // Tüm öğrencilerin son 10 yoklamalarını getir
  getAllStudentsRecentAttendances: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      courseId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { search, courseId } = input;

      const whereStudent: any = {};
      if (search) {
        const searchTerms = search.trim().split(/\s+/); // Boşluklara göre ayır
        
        if (searchTerms.length === 1) {
          // Tek kelime - isim veya soyisimde ara
          whereStudent.OR = [
            { firstName: { contains: searchTerms[0], mode: 'insensitive' } },
            { lastName: { contains: searchTerms[0], mode: 'insensitive' } },
          ];
        } else {
          // Birden fazla kelime - tam isim kombinasyonlarında ara
          const [firstTerm, ...restTerms] = searchTerms;
          const lastTerm = restTerms.join(' ');
          
          whereStudent.OR = [
            // İsim + Soyisim
            {
              AND: [
                { firstName: { contains: firstTerm, mode: 'insensitive' } },
                { lastName: { contains: lastTerm, mode: 'insensitive' } },
              ],
            },
            // Soyisim + İsim (ters sıra)
            {
              AND: [
                { firstName: { contains: lastTerm, mode: 'insensitive' } },
                { lastName: { contains: firstTerm, mode: 'insensitive' } },
              ],
            },
            // Herhangi bir kelimeyi isimde ara
            { firstName: { contains: search, mode: 'insensitive' } },
            // Herhangi bir kelimeyi soyisimde ara
            { lastName: { contains: search, mode: 'insensitive' } },
            // İlk kelimeyi isimde ara
            { firstName: { contains: firstTerm, mode: 'insensitive' } },
            // Son kelimeyi soyisimde ara
            { lastName: { contains: lastTerm, mode: 'insensitive' } },
          ];
        }
      }

      // Eğer courseId verilmişse, sadece o kursa kayıtlı öğrencileri getir
      if (courseId) {
        whereStudent.studentCourses = {
          some: {
            courseId: courseId,
          },
        };
      }

      const whereAttendance: any = {};
      if (courseId) {
        whereAttendance.courseId = courseId;
      }

      const students = await db.student.findMany({
        where: whereStudent,
        include: {
          attendances: {
            where: whereAttendance,
            include: {
              course: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: {
              date: 'desc',
            },
            take: 10,
          },
        },
        orderBy: {
          firstName: 'asc',
        },
      });

      return students.map((student: any) => {
        const totalAttendances = student.attendances.length;
        // Yeni schema'da sadece status kullan
        const presentCount = student.attendances.filter((a: any) => a.status === 'PRESENT').length;
        const attendanceRate = totalAttendances > 0 ? (presentCount / totalAttendances) * 100 : 0;

        return {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          recentAttendances: student.attendances, // Artık direkt status field'ı var
          attendanceRate: Math.round(attendanceRate),
        };
      });
    }),

  // Belirli bir kurs seviyesinde belirli bir tarihte yoklama alınıp alınamayacağını kontrol et
  canTakeAttendanceForDate: publicProcedure
    .input(z.object({
      courseLevelId: z.string(),
      date: z.date(),
    }))
    .query(async ({ input }) => {
      const { courseLevelId, date } = input;

      // Kurs seviyesini ve yoklama günlerini getir
      const courseLevel = await db.courseLevel.findUnique({
        where: { id: courseLevelId },
        include: { 
          course: { 
            select: { name: true } 
          }
        },
      });

      if (!courseLevel) {
        return { canTake: false, reason: 'Kurs seviyesi bulunamadı' };
      }

      // Seçilen tarihin hangi gün olduğunu öğren
      const selectedDate = new Date(date);
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const selectedDayName = dayNames[selectedDate.getDay()];

      // Kurs seviyesinde o gün yoklama alınıyor mu?
      const canTakeOnDay = courseLevel.attendanceDays.includes(selectedDayName);

      if (!canTakeOnDay) {
        return { 
          canTake: false, 
          reason: `${courseLevel.course.name} - ${courseLevel.level} seviyesi için seçilen gün yoklama günü değil` 
        };
      }

      // O tarihte zaten yoklama alınmış mı kontrol et (bilgi amaçlı)
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const existingAttendance = await db.attendance.findFirst({
        where: {
          courseLevelId,
          date: {
            gte: dateStart,
            lte: dateEnd,
          },
        },
      });

      // Artık mevcut yoklama olsa bile yeni yoklama alınabilir (üzerine yazar)
      return { 
        canTake: true, 
        reason: existingAttendance ? 'Bu tarihte zaten yoklama var - yeni yoklama üzerine yazacak' : 'Yoklama alınabilir' 
      };
    }),

  // Belirli bir kurs seviyesinde bugün yoklama alınıp alınamayacağını kontrol et
  canTakeAttendanceToday: publicProcedure
    .input(z.object({
      courseLevelId: z.string(),
    }))
    .query(async ({ input }) => {
      const { courseLevelId } = input;

      // Kurs seviyesini ve yoklama günlerini getir
      const courseLevel = await db.courseLevel.findUnique({
        where: { id: courseLevelId },
        include: { 
          course: { 
            select: { name: true } 
          }
        },
      });

      if (!courseLevel) {
        return { canTake: false, reason: 'Kurs seviyesi bulunamadı' };
      }

      // Bugünün hangi gün olduğunu öğren
      const today = new Date();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[today.getDay()];

      // Kurs seviyesinde bugün yoklama alınıyor mu?
      const canTakeToday = courseLevel.attendanceDays.includes(todayName);

      // Bugün zaten yoklama alınmış mı kontrol et (bilgi amaçlı)
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const existingAttendance = await db.attendance.findFirst({
        where: {
          courseLevelId,
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      // Artık mevcut yoklama olsa bile yeni yoklama alınabilir (üzerine yazar)
      return { 
        canTake: canTakeToday, 
        reason: canTakeToday ? 
          (existingAttendance ? 'Bugün zaten yoklama var - yeni yoklama üzerine yazacak' : 'Yoklama alınabilir') 
          : `${courseLevel.course.name} - ${courseLevel.level} seviyesi için bugün yoklama günü değil` 
      };
    }),

  // Yoklama için öğrencileri getir (kurs seviyesi bazında)
  getStudentsForAttendance: publicProcedure
    .input(z.object({
      courseLevelId: z.string(),
      date: z.date(),
    }))
    .query(async ({ input }) => {
      const { courseLevelId, date } = input;

      // Kurs seviyesine kayıtlı öğrencileri getir
      const studentCourses = await db.studentCourse.findMany({
        where: { courseLevelId },
        include: {
          student: true,
        },
      });

      // Belirtilen tarihte mevcut yoklamaları getir
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const existingAttendances = await db.attendance.findMany({
        where: {
          courseLevelId,
          date: {
            gte: dateStart,
            lte: dateEnd,
          },
        },
      });

      // Öğrencileri mevcut yoklama durumlarıyla birleştir
      const studentsWithAttendance = studentCourses.map((sc: any) => {
        const attendance = existingAttendances.find((a: any) => a.studentId === sc.student.id);
        // Yeni schema'da direkt status kullan (type casting)
        const status = (attendance as any)?.status || 'ABSENT';
        return {
          id: sc.student.id,
          firstName: sc.student.firstName,
          lastName: sc.student.lastName,
          gender: sc.student.gender,
          status: status,
          attendanceId: attendance?.id || null,
          notes: attendance?.notes || '',
        };
      });

      return studentsWithAttendance;
    }),

  // Toplu yoklama kaydet (kurs seviyesi bazında)
  createBulk: publicProcedure
    .input(z.object({
      courseLevelId: z.string(),
      date: z.date(),
      attendances: z.array(z.object({
        studentId: z.string(),
        status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED']),
        notes: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const { courseLevelId, date, attendances } = input;

      // Önce o tarihte o kurs seviyesi için mevcut yoklamaları sil
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      await db.attendance.deleteMany({
        where: {
          courseLevelId,
          date: {
            gte: dateStart,
            lte: dateEnd,
          },
        },
      });

      // Kurs seviyesi bilgisini al
      const courseLevel = await db.courseLevel.findUnique({
        where: { id: courseLevelId },
        select: { courseId: true },
      });

      if (!courseLevel) {
        throw new Error('Kurs seviyesi bulunamadı');
      }

      // Yeni yoklamaları ekle
      const attendanceRecords = attendances.map(att => ({
        studentId: att.studentId,
        courseId: courseLevel.courseId,
        courseLevelId,
        date,
        status: att.status,
        notes: att.notes || '',
      }));

      await db.attendance.createMany({
        data: attendanceRecords,
      });

      return { success: true, count: attendanceRecords.length };
    }),

  // Yoklama al (kurs seviyesi bazında)
  takeAttendance: publicProcedure
    .input(z.object({
      staffId: z.string().optional(), // Yoklamayı alan eğitmen
      attendanceData: z.array(z.object({
        studentId: z.string(),
        courseLevelId: z.string(),
        date: z.date(),
        status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED']),
        notes: z.string().optional(),
      }))
    }))
    .mutation(async ({ input }) => {
      // Önce aynı tarih ve kurs seviyesi için mevcut kayıtları sil
      if (input.attendanceData.length > 0) {
        const firstRecord = input.attendanceData[0];
        const dateStart = new Date(firstRecord.date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(firstRecord.date);
        dateEnd.setHours(23, 59, 59, 999);

        await db.attendance.deleteMany({
          where: {
            courseLevelId: firstRecord.courseLevelId,
            date: {
              gte: dateStart,
              lte: dateEnd,
            },
          },
        });
      }

      // Kurs seviyesi bilgisini al ve courseId ekle
      const courseLevelId = input.attendanceData[0]?.courseLevelId;
      const courseLevel = await db.courseLevel.findUnique({
        where: { id: courseLevelId },
        select: { courseId: true },
      });

      if (!courseLevel) {
        throw new Error('Kurs seviyesi bulunamadı');
      }

      // Yeni kayıtları ekle
      const attendanceRecords = input.attendanceData.map(record => ({
        studentId: record.studentId,
        courseId: courseLevel.courseId,
        courseLevelId: record.courseLevelId,
        staffId: input.staffId || null, // Eğitmen ID'sini kaydet
        date: record.date,
        status: record.status,
        notes: record.notes || '',
      }));

      const createdAttendance = await db.attendance.createMany({
        data: attendanceRecords,
      });

      return createdAttendance;
    }),

  // Yoklama kayıtlarını getir (filtrelere göre)
  getAttendanceRecords: publicProcedure
    .input(z.object({
      courseId: z.string().optional(),
      courseLevelId: z.string().optional(),
      studentId: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const whereConditions: any = {};

      if (input.courseId) {
        whereConditions.courseId = input.courseId;
      }

      if (input.courseLevelId) {
        whereConditions.courseLevelId = input.courseLevelId;
      }

      if (input.studentId) {
        whereConditions.studentId = input.studentId;
      }

      if (input.dateFrom || input.dateTo) {
        whereConditions.date = {};
        if (input.dateFrom) {
          whereConditions.date.gte = input.dateFrom;
        }
        if (input.dateTo) {
          whereConditions.date.lte = input.dateTo;
        }
      }

      const attendanceRecords = await db.attendance.findMany({
        where: whereConditions,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
            },
          },
          courseLevel: {
            select: {
              id: true,
              level: true,
              attendanceDays: true,
            },
          },
          staff: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
            },
          },
        },
        orderBy: [
          { date: 'desc' },
          { student: { firstName: 'asc' } },
        ],
      });

      // Status alanını direkt döndür - yeni schema'da status var
      return attendanceRecords;
    }),

  // Öğrenci bazında devam istatistikleri
  getStudentAttendanceStats: publicProcedure
    .input(z.object({
      studentId: z.string(),
      courseId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const whereConditions: any = {
        studentId: input.studentId,
      };

      if (input.courseId) {
        whereConditions.courseId = input.courseId;
      }

      const totalAttendance = await db.attendance.count({
        where: whereConditions,
      });

      const presentAttendance = await db.attendance.count({
        where: {
          ...whereConditions,
          status: 'PRESENT',
        },
      });

      const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

      return {
        totalSessions: totalAttendance,
        presentSessions: presentAttendance,
        absentSessions: totalAttendance - presentAttendance,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      };
    }),

  // Öğrencinin son yoklama kayıtlarını getir
  getStudentRecentAttendances: publicProcedure
    .input(z.object({
      studentId: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const attendances = await db.attendance.findMany({
        where: {
          studentId: input.studentId,
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: input.limit,
      });

      return attendances;
    }),

  // Tek bir yoklama kaydını güncelle (status ve notlar)
  updateAttendance: publicProcedure
    .input(z.object({
      attendanceId: z.string(),
      status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { attendanceId, status, notes } = input;

      const updated = await db.attendance.update({
        where: { id: attendanceId },
        data: {
          status,
          notes: notes || '',
        },
      });

      return updated;
    }),

  // Belirli bir kursun son yoklamalarını getir
  getRecentByCourse: publicProcedure
    .input(z.string())
    .query(async ({ input: courseId }) => {
      const attendances = await db.attendance.findMany({
        where: {
          courseId: courseId,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: 20, // Son 20 yoklama kaydı
      });

      return attendances;
    }),
});