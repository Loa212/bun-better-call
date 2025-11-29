import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { env } from "./env";

const pool = new Pool({
	connectionString: env.DATABASE_URL,
});

export const auth = betterAuth({
	database: pool,
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
	},
});
