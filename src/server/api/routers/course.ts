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

    // Normalize courseLevels.attendanceDays from DB (stored as comma string) to string[]
    return courses.map((course: any) => ({
      ...course,
      courseLevels: course.courseLevels?.map((level: any) => ({
        ...level,
        attendanceDays: typeof level.attendanceDays === 'string' && level.attendanceDays.length > 0
          ? level.attendanceDays.split(',')
          : [],
      })) || [],
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
        courseLevels: course.courseLevels?.map((level: any) => ({
          ...level,
          attendanceDays: typeof level.attendanceDays === 'string' && level.attendanceDays.length > 0
            ? level.attendanceDays.split(',')
            : [],
        })) || [],
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

        // Mevcut seviyeleri al
        const existingLevels = await tx.courseLevel.findMany({ where: { courseId: id } });

        // Map existing by level enum for easy lookup
        const existingByLevel: Record<string, any> = {};
        existingLevels.forEach((l: any) => {
          existingByLevel[l.level] = l;
        });

        const processedLevelIds: string[] = [];

        // Upsert: update attendanceDays for existing levels with same enum, or create new ones
        for (const lvl of levels) {
          const attendanceStr = lvl.attendanceDays.join(',');
          const existing = existingByLevel[lvl.level];
          if (existing) {
            const updated = await tx.courseLevel.update({
              where: { id: existing.id },
              data: { attendanceDays: attendanceStr },
            });
            processedLevelIds.push(updated.id);
          } else {
            const created = await tx.courseLevel.create({
              data: { courseId: id, level: lvl.level, attendanceDays: attendanceStr },
            });
            processedLevelIds.push(created.id);
          }
        }

        // Delete any existing levels that are not present in the new input AND have no enrolled students
        const toDelete = existingLevels.filter((l: any) => !processedLevelIds.includes(l.id));
        for (const del of toDelete) {
          const scCount = await tx.studentCourse.count({ where: { courseLevelId: del.id } });
          if (scCount === 0) {
            await tx.courseLevel.delete({ where: { id: del.id } });
          } else {
            // If there are students on this level, skip deletion to avoid orphaning studentCourse records
            // and optionally keep level as-is. We do nothing here.
          }
        }

        const courseLevels = await tx.courseLevel.findMany({ where: { courseId: id } });

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