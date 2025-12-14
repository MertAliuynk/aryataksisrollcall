import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import { db } from '../db';

import jwt from 'jsonwebtoken';
// NextRequest kaldırıldı, sadece Request kullanılacak

// Sadece Request ile uyumlu context
const createContext = async (opts?: { req?: Request }) => {
  let user = null;
  const req = opts?.req;
  let token = null;
  if (req) {
    // Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Cookie (manuel parse)
    if (!token) {
      const cookie = req.headers.get('cookie');
      if (cookie) {
        const match = cookie.match(/token=([^;]+)/);
        if (match) token = match[1];
      }
    }
    if (token) {
      try {
        user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      } catch (e) {
        user = null;
      }
    }
  }
  return { db, user };
};

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// protectedProcedure: Giriş yapmış kullanıcıyı zorunlu kılar
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { user: ctx.user } });
});

export { createContext };