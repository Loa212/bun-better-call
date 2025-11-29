import { auth } from "./src/lib/auth";
import { env } from "./src/lib/env";
import { router } from "./src/lib/server";
import homepage from "./src/pages/index.html";

const server = Bun.serve({
	port: env.PORT,
	routes: {
		"/": homepage,
		"/api/auth/*": auth.handler,
		"/api/*": router.handler,
	},
});

console.log(`Listening on ${server.url}`);
