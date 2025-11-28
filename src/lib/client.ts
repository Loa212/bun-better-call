import { createClient } from "better-call/client";
import type { Todo } from "./database";
import type { router } from "./server";

const client = createClient<typeof router>({
	baseURL: `${window.location.origin}/api`,
});

const todosContainer = document.getElementById("todos");
const form = document.getElementById("todo-form") as HTMLFormElement | null;

const renderTodos = (todos: Todo[]) => {
	if (!todosContainer) return;

	if (!todos.length) {
		todosContainer.innerHTML =
			'<p class="text-center text-slate-500">No todos yet. Add one above!</p>';
		return;
	}

	const listItems = todos
		.map(
			(todo) => `
        <li class="rounded border border-slate-200 bg-white p-3 shadow-sm">
          <p class="font-semibold text-slate-800">${todo.title}</p>
          ${
						todo.description
							? `<p class="text-sm text-slate-500">${todo.description}</p>`
							: ""
					}
        </li>
      `,
		)
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

	try {
		const response = await fetch(currentForm.action, {
			method: currentForm.method,
			body: formData,
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
