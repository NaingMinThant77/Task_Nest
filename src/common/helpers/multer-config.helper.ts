/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = (destination: string) => ({
  storage: diskStorage({
    destination: `./uploads/${destination}`,
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${destination}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(new BadRequestException('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const taskMulterOptions = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
  fileFilter: (req, file, callback) => {
    // Optional: add more mimetypes like 'application/pdf'
    if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
      return callback(new BadRequestException('Only images and PDFs are allowed!'), false);
    }
    callback(null, true);
  },
};