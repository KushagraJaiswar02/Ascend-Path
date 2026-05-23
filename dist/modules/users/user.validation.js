"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.registerUserSchema = void 0;
const zod_1 = require("zod");
const user_model_1 = require("./user.model");
const skillItemSchema = zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.object({
        name: zod_1.z.string().min(1),
        level: zod_1.z.string().optional(),
        years: zod_1.z.number().optional(),
    })
]);
exports.registerUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').trim(),
        email: zod_1.z.string().email('Invalid email address').trim().toLowerCase(),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        educationLevel: zod_1.z.nativeEnum(user_model_1.EducationLevel).optional(),
        bio: zod_1.z.string().optional(),
        domains: zod_1.z.array(zod_1.z.string()).optional(),
        skills: zod_1.z.array(skillItemSchema).optional(),
        interests: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
        educationLevel: zod_1.z.nativeEnum(user_model_1.EducationLevel).optional(),
        bio: zod_1.z.string().optional(),
        domains: zod_1.z.array(zod_1.z.string()).optional(),
        skills: zod_1.z.array(skillItemSchema).optional(),
        interests: zod_1.z.array(zod_1.z.string()).optional(),
        avatar: zod_1.z.string().url('Invalid URL format for avatar').optional(),
        pingAvailable: zod_1.z.boolean().optional(),
    }),
});
