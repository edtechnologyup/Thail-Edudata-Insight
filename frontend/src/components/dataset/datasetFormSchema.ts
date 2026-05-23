import { z } from "zod";

export const datasetFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categoryLevel1: z.string().min(1),
  categoryLevel2: z.string().min(1),
  license: z.enum(["open", "conditional", "cc"]),
  tags: z.array(z.string()).max(10).default([]),
  year: z.coerce.number().optional(),
  province: z.string().optional(),
});

export type DatasetFormValues = z.infer<typeof datasetFormSchema>;
