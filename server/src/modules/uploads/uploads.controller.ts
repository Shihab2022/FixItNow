/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import { v2 as cloudinary } from 'cloudinary';
import config from '../../config';
import ApiError from '../../helpars/ApiError';
import catchAsync from '../../helpars/catchAsync';
import sendResponse from '../../helpars/sendResponse';
import { upload } from './multer';

// Configure the Cloudinary SDK once (no-op if credentials are missing)
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
});

/** multer middleware that expects a field named `image` */
export const uploadSingleImage: RequestHandler = upload.single('image');

export const UploadImage = catchAsync(
    async (req: Request, res: Response) => {
        const file = (req as any).file as Express.Multer.File | undefined;

        if (!file?.buffer) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'No image file was uploaded (field name: image)');
        }

        if (
            !config.cloudinary.cloud_name ||
            !config.cloudinary.api_key ||
            !config.cloudinary.api_secret
        ) {
            throw new ApiError(
                httpStatus.SERVICE_UNAVAILABLE,
                'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment.',
            );
        }

        const folder = config.cloudinary.folder || 'fixitnow';
        const publicId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

        const uploadStreamResult = await new Promise<{ secure_url: string; public_id: string }>(
            (resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder, public_id: publicId, resource_type: 'image', overwrite: true },
                    (err, result) => {
                        if (err || !result) {
                            reject(err || new Error('Cloudinary upload failed.'));
                        } else {
                            resolve({ secure_url: result.secure_url, public_id: result.public_id });
                        }
                    },
                );
                stream.end(file.buffer);
            },
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Image uploaded successfully!',
            data: {
                url: uploadStreamResult.secure_url,
                publicId: uploadStreamResult.public_id,
            },
        });
    },
);

export const UploadsController = {
    UploadImage,
};