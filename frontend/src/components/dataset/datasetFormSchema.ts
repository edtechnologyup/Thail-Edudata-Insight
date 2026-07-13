import { z } from "zod";

export const datasetFormSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  license: z.enum(["open", "conditional", "cc"]),
  tags: z.array(z.string()).max(10).default([]),
  yearStart: z.coerce.number().min(2500).max(2600),
  yearEnd: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(2500).max(2600).optional()
  ),
  province: z.string().optional(),
  dataType: z.string().optional(),
  contactUnit: z.string().max(150).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  objective: z.string().optional(),
  updateFrequencyUnit: z.string().optional(),
  updateFrequencyValue: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(1).optional()
  ),
  geographicScope: z.string().optional(),
  dataSource: z.string().optional(),
}).superRefine((values, ctx) => {
  if (
    values.yearEnd !== undefined &&
    values.yearEnd < values.yearStart
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["yearEnd"],
      message: "yearEndBeforeStart",
    });
  }
});

export type DatasetFormValues = z.infer<typeof datasetFormSchema>;
