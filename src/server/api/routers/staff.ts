import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import bcrypt from "bcryptjs";

export const staffRouter = createTRPCRouter({
  // Tüm staff kullanıcılarını getir
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const staff = await ctx.db.staff.findMany({
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return staff;
    }),

  // ID'ye göre staff kullanıcısı getir
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const staff = await ctx.db.staff.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return staff;
    }),

  // Yeni staff kullanıcısı oluştur
  create: publicProcedure
    .input(z.object({
      username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
      password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
      firstName: z.string().min(1, "Ad zorunludur"),
      lastName: z.string().min(1, "Soyad zorunludur"),
      email: z.string().email().optional().or(z.literal("")),
      role: z.string().default("staff"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Kullanıcı adı kontrolü
      const existingUser = await ctx.db.staff.findUnique({
        where: { username: input.username },
      });

      if (existingUser) {
        throw new Error("Bu kullanıcı adı zaten kullanılıyor");
      }

      // Şifreyi hash'le
      const hashedPassword = await bcrypt.hash(input.password, 12);

      const staff = await ctx.db.staff.create({
        data: {
          username: input.username,
          password: hashedPassword,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email || null,
          role: input.role,
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return staff;
    }),

  // Staff kullanıcısını güncelle
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
      password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").optional(),
      firstName: z.string().min(1, "Ad zorunludur"),
      lastName: z.string().min(1, "Soyad zorunludur"),
      email: z.string().email().optional().or(z.literal("")),
      role: z.string().default("staff"),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      // Kullanıcı adı kontrolü (kendisi hariç)
      const existingUser = await ctx.db.staff.findFirst({
        where: {
          username: input.username,
          id: { not: input.id },
        },
      });

      if (existingUser) {
        throw new Error("Bu kullanıcı adı zaten kullanılıyor");
      }

      const updateData: any = {
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email || null,
        role: input.role,
        isActive: input.isActive,
      };

      // Eğer şifre verilmişse hash'le ve ekle
      if (input.password && input.password.trim() !== "") {
        updateData.password = await bcrypt.hash(input.password, 12);
      }

      const staff = await ctx.db.staff.update({
        where: { id: input.id },
        data: updateData,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return staff;
    }),

  // Staff kullanıcısını sil
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.staff.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Staff kullanıcısının aktif durumunu değiştir
  toggleActive: publicProcedure
    .input(z.object({ 
      id: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const staff = await ctx.db.staff.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return staff;
    }),
});