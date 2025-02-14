import { PrismaClient } from "@prisma/client";
import { userResponseSchema, type UserResponse } from "../types/index";

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async validateUserSession(userId: number): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true, // Optionally check if user is still active
      },
    });

    if (!user) return null;

    return userResponseSchema.parse(user);
  }
}
