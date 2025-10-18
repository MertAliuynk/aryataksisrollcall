import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "../../db";

export const paymentRouter = createTRPCRouter({
  // Ödeme kontrolü için öğrencileri getir
  getStudentsForPaymentControl: publicProcedure
    .input(z.object({
      courseId: z.string(),
      courseLevelId: z.string(),
      month: z.number().min(1).max(12),
      year: z.number().min(2020).max(2030)
    }))
    .query(async ({ input }) => {
      const { courseId, courseLevelId, month, year } = input;

      // Bu kurs seviyesindeki öğrencileri getir
      const studentCourses = await db.studentCourse.findMany({
        where: {
          courseId,
          courseLevelId,
        },
        include: {
          student: true,
          course: true,
          courseLevel: true,
        },
      });

      // Her öğrenci için ödeme durumunu kontrol et
      const studentsWithPayments = await Promise.all(
        studentCourses.map(async (sc) => {
          const existingPayment = await db.payment.findUnique({
            where: {
              studentId_courseLevelId_month_year: {
                studentId: sc.studentId,
                courseLevelId: sc.courseLevelId,
                month,
                year,
              },
            },
          });

          return {
            ...sc,
            payment: existingPayment,
          };
        })
      );

      return studentsWithPayments;
    }),

  // Ödeme durumunu güncelle/oluştur
  updatePaymentStatus: publicProcedure
    .input(z.object({
      studentId: z.string(),
      courseId: z.string(),
      courseLevelId: z.string(),
      month: z.number().min(1).max(12),
      year: z.number().min(2020).max(2030),
      status: z.enum(["PAID", "PENDING", "EXCUSED"]),
      amount: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { studentId, courseId, courseLevelId, month, year, status, amount, notes } = input;

      const paidAt = status === "PAID" ? new Date() : null;

      const payment = await db.payment.upsert({
        where: {
          studentId_courseLevelId_month_year: {
            studentId,
            courseLevelId,
            month,
            year,
          },
        },
        update: {
          status,
          amount,
          notes,
          paidAt,
          updatedAt: new Date(),
        },
        create: {
          studentId,
          courseId,
          courseLevelId,
          month,
          year,
          status,
          amount,
          notes,
          paidAt,
        },
      });

      return payment;
    }),

  // Ödeme takip sayfası için öğrenci ödemelerini getir
  getStudentPayments: publicProcedure
    .input(z.object({
      studentId: z.string(),
      year: z.number().min(2020).max(2030).optional(),
    }))
    .query(async ({ input }) => {
      const { studentId, year = new Date().getFullYear() } = input;

      const payments = await db.payment.findMany({
        where: {
          studentId,
          year,
        },
        include: {
          course: true,
          courseLevel: true,
        },
        orderBy: [
          { course: { name: "asc" } },
          { courseLevel: { level: "asc" } },
          { month: "asc" },
        ],
      });

      return payments;
    }),

  // Kurs ve seviye için ödeme geçmişini getir
  getPaymentHistory: publicProcedure
    .input(z.object({
      courseId: z.string(),
      courseLevelId: z.string(),
      year: z.number().min(2020).max(2030).optional(),
    }))
    .query(async ({ input }) => {
      const { courseId, courseLevelId, year = new Date().getFullYear() } = input;

      const payments = await db.payment.findMany({
        where: {
          courseId,
          courseLevelId,
          year,
        },
        include: {
          student: true,
          course: true,
          courseLevel: true,
        },
        orderBy: [
          { month: "asc" },
          { student: { firstName: "asc" } },
        ],
      });

      return payments;
    }),

  // Aylık ödeme kontrolü yapılıp yapılmadığını kontrol et
  checkMonthlyPaymentControl: publicProcedure
    .input(z.object({
      courseId: z.string(),
      courseLevelId: z.string(),
      month: z.number().min(1).max(12),
      year: z.number().min(2020).max(2030),
    }))
    .query(async ({ input }) => {
      const { courseId, courseLevelId, month, year } = input;

      const paymentCount = await db.payment.count({
        where: {
          courseId,
          courseLevelId,
          month,
          year,
        },
      });

      return {
        hasPaymentControl: paymentCount > 0,
        paymentCount,
      };
    }),

  // Ödeme istatistikleri
  getPaymentStats: publicProcedure
    .input(z.object({
      courseId: z.string().optional(),
      courseLevelId: z.string().optional(),
      month: z.number().min(1).max(12).optional(),
      year: z.number().min(2020).max(2030).optional(),
    }))
    .query(async ({ input }) => {
      const { courseId, courseLevelId, month, year = new Date().getFullYear() } = input;

      const where: any = { year };
      if (courseId) where.courseId = courseId;
      if (courseLevelId) where.courseLevelId = courseLevelId;
      if (month) where.month = month;

      const stats = await db.payment.groupBy({
        by: ["status"],
        where,
        _count: {
          status: true,
        },
      });

      const totalAmount = await db.payment.aggregate({
        where: {
          ...where,
          status: "PAID",
        },
        _sum: {
          amount: true,
        },
      });

      return {
        stats,
        totalAmount: totalAmount._sum.amount || 0,
      };
    }),
});