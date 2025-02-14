import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import {
  createUserSchema,
  createPostSchema,
  type UserResponse,
  type PostResponse,
} from "../src/types/index";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const userData1 = createUserSchema.parse({
    username: "admin_john",
    name: "Admin John",
    password: await bcrypt.hash("password123", 10),
    isActive: true,
  });

  const userData2 = createUserSchema.parse({
    username: "jane_smith",
    name: "Jane Smith",
    password: await bcrypt.hash("password456", 10),
    isActive: true,
  });

  const userData3 = createUserSchema.parse({
    username: "bob_wilson",
    name: "Bob Wilson",
    password: await bcrypt.hash("password789", 10),
    isActive: true,
  });

  const user1 = await prisma.user.create({ data: userData1 });
  const user2 = await prisma.user.create({ data: userData2 });
  const user3 = await prisma.user.create({ data: userData3 });

  console.log("Created users:", { user1, user2, user3 });

  // Create 1000+ posts
  const users = [user1, user2, user3];
  const createdPosts: Array<{
    id: number;
    title: string;
    content: string;
    published: boolean;
    tags: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  for (let i = 0; i < 1000; i++) {
    const postData = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      published: faker.datatype.boolean(),
      tags: faker.helpers
        .arrayElements(
          ["tech", "news", "sports", "lifestyle", "food", "travel"],
          { min: 1, max: 3 }
        )
        .join(","),
    };

    try {
      // Validate the data
      const validatedPostData = createPostSchema.parse(postData);

      const post = await prisma.post.create({
        data: validatedPostData,
      });

      createdPosts.push(post);

      // Log progress every 100 posts
      if ((i + 1) % 100 === 0) {
        console.log(`Created ${i + 1} posts`);
      }
    } catch (error) {
      console.error(`Error creating post ${i}:`, error);
      continue; // Skip this post and continue with the next one
    }
  }

  console.log("Database seeding completed!");
  console.log(`Created ${createdPosts.length} posts`);
}

main()
  .catch((e) => {
    if (e instanceof Error) {
      console.error("Error:", e.message);
    } else {
      console.error("Unknown error:", e);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
