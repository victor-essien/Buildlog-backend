import dotenv from "dotenv";
dotenv.config();


export const NODE_ENV = process.env.NODE_ENV || 'development';
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
export const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES!;
export const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES!;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
