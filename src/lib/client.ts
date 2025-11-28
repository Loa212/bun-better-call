import { createClient } from "better-call/client";
import type { Todo } from "./database";
import type { router } from "./server";

const client = createClient<typeof router>({
	baseURL: `${window.location.origin}/api`,
});

const todosContainer = document.getElementById("todos");
const form = document.getElementById("todo-form") as HTMLFormElement | null;

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

const renderTodos = (todos: Todo[]) => {
	if (!todosContainer) return;

	if (!todos.length) {
		todosContainer.innerHTML =
			'<p class="text-center text-slate-500">No todos yet. Add one above!</p>';
		return;
	}

	const listItems = todos
		.map((todo) => {
			const statusClass = todo.done ? "text-green-600" : "text-yellow-600";
			const statusLabel = todo.done ? "Done" : "Pending";
			return `
				<li class="rounded border border-slate-200 bg-white p-3 shadow-sm">
					<div class="flex items-center justify-between gap-4">
						<p class="font-semibold text-slate-800 ${
							todo.done ? "line-through text-slate-500" : ""
						}">
							${escapeHtml(todo.title)}
						</p>
						<span class="text-xs font-semibold uppercase tracking-wide ${statusClass}">
							${statusLabel}
						</span>
					</div>
					${
						todo.description
							? `<p class="mt-1 text-sm text-slate-500 ${todo.done ? "line-through" : ""}">
									${escapeHtml(todo.description)}
								</p>`
							: ""
					}
				</li>
			`;
		})
		.join("");

	todosContainer.innerHTML = `<ul class="space-y-3">${listItems}</ul>`;
};

const loadTodos = async () => {
	try {
		const response = await client("/todos");

		if (response.error) {
			throw new Error(response.error.statusText || "Failed to load todos");
		}

		renderTodos(response.data);
	} catch (error) {
		console.error("Failed to load todos", error);
		if (todosContainer) {
			todosContainer.textContent =
				"Failed to load todos. Please refresh the page.";
		}
	}
};

await loadTodos();

form?.addEventListener("submit", async (event) => {
	event.preventDefault();

	const currentForm = event.currentTarget as HTMLFormElement;
	const formData = new FormData(currentForm);
	const title = String(formData.get("title") ?? "").trim();
	const descriptionRaw = formData.get("description");
	const description =
		typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
			? descriptionRaw.trim()
			: undefined;
	const done = formData.get("done") === "on";

	if (!title) {
		alert("Title is required.");
		return;
	}

	try {
		const response = await fetch(currentForm.action, {
			method: currentForm.method,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				title,
				description,
				done,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to create todo: ${response.statusText}`);
		}

		currentForm.reset();
		window.location.href = "/";
	} catch (error) {
		console.error("Failed to create todo", error);
		alert("Unable to create todo. Please try again.");
	}
});
