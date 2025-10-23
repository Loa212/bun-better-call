import { router } from "./src/lib/server";
import homepage from "./src/pages/index.html";

const server = Bun.serve({
	port: 3000,
	routes: {
		"/": homepage,
		"/api/*": router.handler,
	},
});

console.log(`Listening on ${server.url}`);
