import { PrismaClient } from "@prisma/client";
import {
  createUserSchema,
  updateUserSchema,
  userResponseSchema,
  type CreateUser,
  type UpdateUser,
  type UserResponse,
} from "../types/index";
import bcrypt from "bcrypt";

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createUser(data: CreateUser): Promise<UserResponse> {
    const validatedData = createUserSchema.parse(data);

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
    });

    return userResponseSchema.parse(user);
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    return user; // Don't transform for login checks
  }

  async findById(id: number): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return userResponseSchema.parse(user);
  }

  async updateUser(id: number, data: UpdateUser): Promise<UserResponse> {
    const validatedData = updateUserSchema.parse(data);

    let updateData = { ...validatedData };
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return userResponseSchema.parse(user);
  }
}
