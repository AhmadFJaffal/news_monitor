import { PrismaClient } from "@prisma/client";
import {
  createPostSchema,
  updatePostSchema,
  postResponseSchema,
  type CreatePost,
  type UpdatePost,
  type PostResponse,
} from "../types/index";

export class PostService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createPost(data: CreatePost): Promise<PostResponse> {
    const validatedData = createPostSchema.parse(data);

    const post = await this.prisma.post.create({
      data: validatedData,
    });

    return postResponseSchema.parse(post);
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.post.count(),
    ]);

    const validatedPosts = posts.map((post) => postResponseSchema.parse(post));

    return {
      posts: validatedPosts,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<PostResponse | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) return null;
    return postResponseSchema.parse(post);
  }

  async updatePost(id: number, data: UpdatePost): Promise<PostResponse> {
    const validatedData = updatePostSchema.parse(data);

    const post = await this.prisma.post.update({
      where: { id },
      data: validatedData,
    });

    return postResponseSchema.parse(post);
  }

  async deletePost(id: number): Promise<void> {
    await this.prisma.post.delete({
      where: { id },
    });
  }

  async searchPosts(searchTerm: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
            { tags: { contains: searchTerm } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.post.count({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { content: { contains: searchTerm } },
            { tags: { contains: searchTerm } },
          ],
        },
      }),
    ]);

    const validatedPosts = posts.map((post) => postResponseSchema.parse(post));

    return {
      posts: validatedPosts,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
