import { createEndpoint, createRouter } from "better-call";
import { z } from "zod";

type Todo = {
	id: string;
	title: string;
	description?: string;
	done?: boolean;
};

const mockTodos: Todo[] = [
	{
		id: "1",
		title: "Learn TypeScript",
		description: "Understand the basics of TypeScript.",
		done: false,
	},
	{
		id: "2",
		title: "Build a REST API",
		description: "Create a simple REST API using Node.js and Express.",
		done: true,
	},
];

export const createTodo = createEndpoint(
	"/todo",
	{
		method: "POST",
		body: z.object({
			title: z.string(),
			description: z.string().optional(),
			done: z.boolean().optional().default(false),
		}),
	},
	async (ctx): Promise<Todo> => {
		// here we are supposed to create a new todo item
		return {
			id: crypto.randomUUID(),
			title: ctx.body.title,
			description: ctx.body.description,
			done: ctx.body.done,
		};
	},
);

export const getTodos = createEndpoint(
	"/todos",
	{
		method: "GET",
		query: z.object({ filter: z.string().optional() }),
	},
	async (ctx): Promise<Todo[]> => {
		const todos = mockTodos;

		if (ctx.query.filter) {
			return todos.filter((todo) =>
				todo.title.includes(ctx.query.filter || ""),
			);
		}

		return todos;
	},
);

export const getTodo = createEndpoint(
	"/todo",
	{
		method: "GET",
		query: z.object({
			id: z.string(),
		}),
	},
	async (ctx): Promise<Todo> => {
		const todo = mockTodos.find((t) => t.id === ctx.query.id);
		if (!todo) {
			throw new Error("Todo not found");
		}
		return todo;
	},
);

export const updateTodo = createEndpoint(
	"/todo",
	{
		method: "PUT",
		query: z.object({
			id: z.string(),
			title: z.string().min(2).max(100).optional(),
			description: z.string().min(5).max(500).optional(),
			done: z.boolean().optional(),
		}),
	},
	async (ctx): Promise<Todo> => {
		const todo = mockTodos.find((t) => t.id === ctx.query.id);
		if (!todo) {
			throw new Error("Todo not found");
		}

		const retVal = {
			...todo,
			title: ctx.query.title ?? todo.title,
			description: ctx.query.description ?? todo.description,
			done: ctx.query.done ?? todo.done,
		} satisfies Todo;

		return retVal;
	},
);

export const router = createRouter(
	{
		createTodo,
		getTodos,
		getTodo,
		updateTodo,
	},
	{ basePath: "/api" },
);
