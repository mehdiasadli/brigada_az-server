import { z } from 'zod';

export const CreatePostDto = z.object({
  content: z
    .string({ required_error: 'Post content is required' })
    .max(500, 'Max length for content is 500 characters'),
});

export type TCreatePostDto = z.infer<typeof CreatePostDto>;
