import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';
import { db } from '../db';

import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

// Kullanıcıyı context'e ekle
const createContext = (opts?: { req?: NextApiRequest }) => {
  let user = null;
  const req = opts?.req;
  if (req) {
    const token = req.headers?.authorization?.split(' ')[1] || req.cookies?.token;
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