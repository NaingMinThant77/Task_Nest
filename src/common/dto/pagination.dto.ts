import * as yup from 'yup';

export const PaginationSchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  limit: yup.number().integer().min(1).max(100).default(10),
});

export type PaginationDto = yup.InferType<typeof PaginationSchema>;