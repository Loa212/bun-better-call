import { createClient } from "better-call/client";
import type { router } from "./server";

const client = createClient<typeof router>({
	baseURL: `${window.location.origin}/api`,
});
const todos = await client("/todos");

const itemsContainer = document.getElementById("todos");
if (itemsContainer) {
	itemsContainer.textContent = JSON.stringify(todos, null, 2);
}

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		console.log("Module updated!");
	});
}
