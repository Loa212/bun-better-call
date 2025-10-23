import homepage from './src/pages/index.html';

const server = Bun.serve({
	port: 3000,
	routes: {
		"/": homepage,
	}
});

console.log(`Listening on ${server.url}`);