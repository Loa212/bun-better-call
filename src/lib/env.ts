import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().int().positive().default(3000),
	DATABASE_URL: z.url({
		message: "DATABASE_URL must be a valid connection string",
	}),
	BETTER_AUTH_SECRET: z.string().min(32, {
		message: "BETTER_AUTH_SECRET must be at least 32 characters long",
	}),
	BETTER_AUTH_URL: z.url({ message: "BETTER_AUTH_URL must be a valid URL" }),
	GITHUB_CLIENT_ID: z.string().min(1, {
		message: "GITHUB_CLIENT_ID is required",
	}),
	GITHUB_CLIENT_SECRET: z.string().min(1, {
		message: "GITHUB_CLIENT_SECRET is required",
	}),
});

export const env = envSchema.parse({
	NODE_ENV: process.env.NODE_ENV,
	PORT: process.env.PORT,
	DATABASE_URL: process.env.DATABASE_URL,
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
});

export type Env = typeof env;
