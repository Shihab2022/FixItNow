import express from 'express';
import auth from '../../middlewares/auth';
import { UploadsController, uploadSingleImage } from './uploads.controller';
import { Role } from '../../../generated/prisma/client';

const router = express.Router();

router.post(
    '/image',
    auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
    uploadSingleImage,
    UploadsController.UploadImage,
);

export const UploadsRouter = router;