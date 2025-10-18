import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { db } from '../../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export const authRouter = createTRPCRouter({
  // Staff sayısını kontrol et (ilk kurulum için)
  getStaffCount: publicProcedure
    .query(async () => {
      const count = await db.staff.count();
      return { count };
    }),

  // Çalışan girişi
  login: publicProcedure
    .input(z.object({
      username: z.string().min(1, 'Kullanıcı adı gerekli'),
      password: z.string().min(1, 'Şifre gerekli'),
    }))
    .mutation(async ({ input }) => {
      const { username, password } = input;

      // Kullanıcıyı veritabanında ara
      const staff = await db.staff.findUnique({
        where: {
          username: username.toLowerCase(),
        },
      });

      if (!staff) {
        throw new Error('Kullanıcı adı veya şifre hatalı');
      }

      if (!staff.isActive) {
        throw new Error('Hesabınız devre dışı bırakılmış');
      }

      // Şifreyi kontrol et
      const isPasswordValid = await bcrypt.compare(password, staff.password);

      if (!isPasswordValid) {
        throw new Error('Kullanıcı adı veya şifre hatalı');
      }

      // JWT token oluştur
      const token = jwt.sign(
        {
          staffId: staff.id,
          username: staff.username,
          role: staff.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        token,
        staff: {
          id: staff.id,
          username: staff.username,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          role: staff.role,
        },
      };
    }),

  // Token doğrulama
  verifyToken: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, JWT_SECRET) as any;
        
        // Kullanıcının hala aktif olup olmadığını kontrol et
        const staff = await db.staff.findUnique({
          where: {
            id: decoded.staffId,
          },
        });

        if (!staff || !staff.isActive) {
          throw new Error('Geçersiz token');
        }

        return {
          staff: {
            id: staff.id,
            username: staff.username,
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            role: staff.role,
          },
        };
      } catch (error) {
        throw new Error('Geçersiz token');
      }
    }),

  // İlk admin kullanıcısı oluştur (sadece hiç kullanıcı yoksa)
  createInitialAdmin: publicProcedure
    .input(z.object({
      username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalı'),
      password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
      firstName: z.string().min(1, 'İsim gerekli'),
      lastName: z.string().min(1, 'Soyisim gerekli'),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      // Hiç kullanıcı var mı kontrol et
      const existingStaff = await db.staff.count();
      
      if (existingStaff > 0) {
        throw new Error('Zaten kullanıcı mevcut. Bu işlem sadece ilk kurulumda kullanılabilir.');
      }

      // Şifreyi hash'le
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Admin kullanıcısı oluştur
      const admin = await db.staff.create({
        data: {
          username: input.username.toLowerCase(),
          password: hashedPassword,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          role: 'admin',
          isActive: true,
        },
      });

      return {
        message: 'Admin kullanıcısı başarıyla oluşturuldu',
        username: admin.username,
      };
    }),
});