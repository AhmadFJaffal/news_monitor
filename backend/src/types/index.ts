import { z } from "zod";

// Base schemas for create operations
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  isActive: z.boolean().optional().default(true),
});

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be less than 255 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  published: z.boolean().optional().default(false),
  tags: z.string().nullable(),
});

// Update schemas (making all fields optional)
export const updateUserSchema = createUserSchema.partial();
export const updatePostSchema = createPostSchema.partial();

// Response schemas (including generated fields)
export const userResponseSchema = createUserSchema
  .extend({
    id: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .omit({ password: true }); // Remove password from response

export const postResponseSchema = createPostSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Array response schemas
export const usersResponseSchema = z.array(userResponseSchema);
export const postsResponseSchema = z.array(postResponseSchema);

// Login schema
export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Types
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

export type CreatePost = z.infer<typeof createPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
export type PostResponse = z.infer<typeof postResponseSchema>;
