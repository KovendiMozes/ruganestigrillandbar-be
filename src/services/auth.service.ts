import bcrypt from 'bcryptjs';
import { prisma } from '@/config/db';
import { HttpError } from '@/utils/httpError';
import { signJwt } from '@/utils/jwt';
import type { LoginDto, RegisterDto } from '@/dtos/auth.dto';

export const authService = {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new HttpError(409, 'Email already registered');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: { email: dto.email, password, name: dto.name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = signJwt({ userId: user.id, email: user.email });
    return { user, token };
  },

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new HttpError(401, 'Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new HttpError(401, 'Invalid credentials');

    const token = signJwt({ userId: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) throw new HttpError(404, 'User not found');
    return user;
  },
};
