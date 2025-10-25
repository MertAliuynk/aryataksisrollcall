import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../db';

export const studentRouter = createTRPCRouter({
  // Tüm öğrencileri listele (basit versiyon)
  getAll: publicProcedure
    .input(z.object({
      courseId: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const where: any = {};

      // Eğer courseId verilmişse, sadece o kursa kayıtlı öğrencileri getir
      if (input?.courseId) {
        where.studentCourses = {
          some: {
            courseId: input.courseId,
          },
        };
      }

      return await db.student.findMany({
        where,
        orderBy: {
          firstName: 'asc',
        },
      });
    }),

  // Tek öğrenci getir
  getById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const student = await db.student.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!student) {
        throw new Error('Öğrenci bulunamadı');
      }

      return student;
    }),

  // Kursa kayıtlı öğrencileri getir
  getByCourse: publicProcedure
    .input(z.string())
    .query(async ({ input: courseId }) => {
      const studentCourses = await db.studentCourse.findMany({
        where: {
          courseId: courseId,
        },
        include: {
          student: true,
          courseLevel: true,
        },
        orderBy: {
          student: {
            firstName: 'asc',
          },
        },
      });

      return studentCourses.map((sc: any) => ({
        ...sc.student,
        level: sc.courseLevel.level,
        levelId: sc.courseLevel.id,
        attendanceDays: sc.courseLevel.attendanceDays.split(','),
        enrolledAt: sc.enrolledAt,
      }));
    }),

  // Öğrencinin kayıtlı olduğu kursları getir
  getCourses: publicProcedure
    .input(z.object({
      studentId: z.string(),
    }))
    .query(async ({ input }) => {
      const studentCourses = await db.studentCourse.findMany({
        where: {
          studentId: input.studentId,
        },
        include: {
          course: true,
          courseLevel: true,
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      });

      return studentCourses.map((sc: any) => ({
        id: sc.course.id,
        name: sc.course.name,
        level: sc.courseLevel.level,
        levelId: sc.courseLevel.id,
        attendanceDays: sc.courseLevel.attendanceDays.split(','),
        enrolledAt: sc.enrolledAt,
      }));
    }),

  // Öğrencileri filtreleyerek listele (gelişmiş versiyon)
  getAllWithFilters: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      courseId: z.string().nullish(),
      gender: z.enum(['male', 'female']).optional(),
      level: z.enum(['temel', 'teknik', 'performans']).optional(),
      sortBy: z.enum(['firstName', 'lastName', 'createdAt', 'birthDate']).default('firstName'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }))
    .query(async ({ input }) => {
      const { search, courseId, gender, sortBy, sortOrder } = input;

      const where: any = {};

      if (search && search.trim()) {
        const searchTerms = search.trim().split(/\s+/); // Boşluklara göre ayır
        
        if (searchTerms.length === 1) {
          // Tek kelime - isim veya soyisimde ara
          where.OR = [
            { firstName: { contains: searchTerms[0], mode: 'insensitive' } },
            { lastName: { contains: searchTerms[0], mode: 'insensitive' } },
          ];
        } else {
          // Birden fazla kelime - tam isim kombinasyonlarında ara
          const [firstTerm, ...restTerms] = searchTerms;
          const lastTerm = restTerms.join(' ');
          
          where.OR = [
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

      if (gender) {
        where.gender = gender;
      }

      if (courseId && courseId !== '' && courseId !== null) {
        where.studentCourses = {
          some: {
            courseId: courseId,
          },
        };
      }

      if (input.level) {
        where.studentCourses = {
          ...(where.studentCourses || {}),
          some: {
            ...(where.studentCourses?.some || {}),
            courseLevel: {
              level: input.level,
            },
          },
        };
      }

      const students = await db.student.findMany({
        where,
        include: {
          studentCourses: {
            include: {
              course: true,
              courseLevel: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      return students.map((student: any) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        birthDate: student.birthDate,
        gender: student.gender,
        tcNumber: student.tcNumber,
        phone: student.phone,
        // include explicit parent fields so list queries have them available
        motherFirstName: student.motherFirstName,
        motherLastName: student.motherLastName,
        motherPhone: student.motherPhone,
        fatherFirstName: student.fatherFirstName,
        fatherLastName: student.fatherLastName,
        fatherPhone: student.fatherPhone,
        email: student.email,
        address: student.address,
        createdAt: student.createdAt,
        coursesCount: student.studentCourses.length,
        courseNames: student.studentCourses.map((sc: any) => sc.course.name),
        courses: student.studentCourses.map((sc: any) => ({
          id: sc.course.id,
          name: sc.course.name,
          level: sc.courseLevel?.level,
          levelId: sc.courseLevel?.id,
        })),
      }));
    }),

  // Yeni öğrenci ekle
  create: publicProcedure
    .input(z.object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      motherFirstName: z.string().optional(),
      motherLastName: z.string().optional(),
      motherPhone: z.string().optional(),
      fatherFirstName: z.string().optional(),
      fatherLastName: z.string().optional(),
      fatherPhone: z.string().optional(),
      birthDate: z.date(),
      gender: z.enum(['male', 'female']).default('male'),
      courseLevelIds: z.array(z.string()).min(1, "En az bir kurs seviyesi seçmelisiniz"),
    }))
    .mutation(async ({ input }) => {
      const { courseLevelIds, ...studentData } = input;

      const student = await db.student.create({
        data: studentData,
      });

      // Öğrenciyi kurs seviyelerine kaydet
      if (courseLevelIds.length > 0) {
        // Course level ID'lerden course ID'leri al
        const courseLevels = await db.courseLevel.findMany({
          where: { id: { in: courseLevelIds } },
          select: { id: true, courseId: true },
        });

        await db.studentCourse.createMany({
          data: courseLevels.map((level) => ({
            studentId: student.id,
            courseId: level.courseId,
            courseLevelId: level.id,
          })),
        });
      }

      return student;
    }),

  // Öğrenci güncelle
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      motherFirstName: z.string().optional(),
      motherLastName: z.string().optional(),
      motherPhone: z.string().optional(),
      fatherFirstName: z.string().optional(),
      fatherLastName: z.string().optional(),
      fatherPhone: z.string().optional(),
      birthDate: z.date(),
      gender: z.enum(['male', 'female']),
      courseLevelIds: z.array(z.string()).min(1, "En az bir kurs seviyesi seçmelisiniz"),
    }))
    .mutation(async ({ input }) => {
      const { id, courseLevelIds, ...studentData } = input;

      // Öğrenciyi güncelle
      const student = await db.student.update({
        where: { id },
        data: studentData,
      });

      // Mevcut kurs kayıtlarını sil
      await db.studentCourse.deleteMany({
        where: { studentId: id },
      });

      // Yeni kurs kayıtlarını ekle
      if (courseLevelIds.length > 0) {
        // Course level ID'lerden course ID'leri al
        const courseLevels = await db.courseLevel.findMany({
          where: { id: { in: courseLevelIds } },
          select: { id: true, courseId: true },
        });

        await db.studentCourse.createMany({
          data: courseLevels.map((level) => ({
            studentId: id,
            courseId: level.courseId,
            courseLevelId: level.id,
          })),
        });
      }

      return student;
    }),
  // Öğrenci silme
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      // Önce öğrenciye ait ilişkileri temizle
      await db.studentCourse.deleteMany({ where: { studentId: id } });

      // Öğrenciyi sil
      await db.student.delete({ where: { id } });

      return { success: true };
    }),
});