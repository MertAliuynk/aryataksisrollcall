import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import { db } from '../db';

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Next.js 13+ app router uyumlu context
const createContext = async (opts?: { req?: NextRequest }) => {
  let user = null;
  const req = opts?.req;
  if (req) {
    let token = null;
    // Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Cookie
    if (!token) {
      const cookie = req.cookies.get('token');
      if (cookie) token = cookie.value;
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