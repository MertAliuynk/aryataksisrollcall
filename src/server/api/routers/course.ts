import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../db';

export const courseRouter = createTRPCRouter({
  // Tüm kursları listele
  getAll: publicProcedure.query(async () => {
    const courses = await db.course.findMany({
      include: {
        courseLevels: true,
        _count: {
          select: {
            studentCourses: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return courses.map((course: any) => ({
      ...course,
      studentCount: course._count.studentCourses,
    }));
  }),

  // Kurs detayını getir
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: courseId }) => {
      const course = await db.course.findUnique({
        where: { id: courseId },
        include: {
          courseLevels: true,
          _count: {
            select: {
              studentCourses: true,
            },
          },
        },
      });

      if (!course) {
        throw new Error('Kurs bulunamadı');
      }

      return {
        ...course,
        studentCount: course._count.studentCourses,
      };
    }),

  // Kurs güncelle
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2),
      description: z.string().optional(),
      levels: z.array(z.object({
        level: z.enum(['temel', 'teknik', 'performans']),
        attendanceDays: z.array(z.string()).min(1),
      })).min(1),
    }))
    .mutation(async ({ input }) => {
      const { id, name, description, levels } = input;

      // Transaction ile kurs ve seviyelerini güncelle
      const result = await db.$transaction(async (tx) => {
        // Kurs bilgilerini güncelle
        const course = await tx.course.update({
          where: { id },
          data: {
            name,
            description,
          },
        });

        // Mevcut seviyeleri sil
        await tx.courseLevel.deleteMany({
          where: { courseId: id },
        });

        // Yeni seviyeleri oluştur
        const courseLevels = await Promise.all(
          levels.map((level) =>
            tx.courseLevel.create({
              data: {
                courseId: id,
                level: level.level,
                attendanceDays: level.attendanceDays.join(','),
              },
            })
          )
        );

        return { course, courseLevels };
      });

      return result.course;
    }),

  // Yeni kurs oluştur
  create: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      levels: z.array(z.object({
        level: z.enum(['temel', 'teknik', 'performans']),
        attendanceDays: z.array(z.string()).min(1),
      })).min(1),
    }))
    .mutation(async ({ input }) => {
      const { name, description, levels } = input;

      // Transaction ile kurs ve seviyelerini oluştur
      const result = await db.$transaction(async (tx) => {
        // Kursu oluştur
        const course = await tx.course.create({
          data: {
            name,
            description,
          },
        });

        // Seviyeleri oluştur
        const courseLevels = await Promise.all(
          levels.map((level) =>
            tx.courseLevel.create({
              data: {
                courseId: course.id,
                level: level.level,
                attendanceDays: level.attendanceDays.join(','),
              },
            })
          )
        );

        return { course, courseLevels };
      });

      return result.course;
    }),

  // Kurs seviyelerini getir
  getLevels: publicProcedure
    .input(z.string())
    .query(async ({ input: courseId }) => {
      const courseLevels = await db.courseLevel.findMany({
        where: { courseId },
        orderBy: {
          level: 'asc',
        },
      });

      return courseLevels.map((level) => ({
        ...level,
        attendanceDays: level.attendanceDays.split(','),
      }));
    }),
});