import { User, clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {id: user.id, name: user.username, profileImageUrl: user.imageUrl};
};

export const postRouter = createTRPCRouter({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),

  // create: publicProcedure
  //   .input(z.object({ 
  //     name: z.string().min(1),
  //     content: z.string(), // Assuming you're getting content from input now
  //     authorId: z.string(), // Assuming you have an authorId from the context or input 
  //   }))
    // .mutation(async ({ ctx, input }) => {
    //   // simulate a slow db call
    //   await new Promise((resolve) => setTimeout(resolve, 1000));

    //   return ctx.db.post.create({
    //     data: {
    //       name: input.name,
    //       content: input.content, // Add content to the data object
    //       authorId: input.authorId, // Add authorId to the data object
    //     },
    //   });
    // }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [
        {createdAt: "desc"}
      ]
    });
    const users = (
      await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
    ).map(filterUserForClient);

    return posts.map(post => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.name) 
        // return {
        //   post,
        //   author: null,
        // }
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found",
        });


      return {
        post,
        author: {
          ...author,
          name: author.name,
        },
    }});
  }),

  create: privateProcedure
  .input(
    z.object({content: z.string().emoji().min(1).max(280)})
  ).mutation(async ({ctx, input }) => {

    const authorId = ctx.userId;
    const name = '';

    const post = await ctx.db.post.create({
      data: {
        authorId,
        content: input.content,
        name,
      }
    })
  })
});
