import {z} from "zod";

const worklogSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

