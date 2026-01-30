/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
  limits: { fileSize: 10 * 1024 * 1024 }, // Increase to 10MB for PDFs
  fileFilter: (req, file, callback) => {
    // Check for specific mimetypes more reliably
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new BadRequestException('Only images (jpg, png) and PDFs are allowed!'), false);
    }
    callback(null, true);
  },
};