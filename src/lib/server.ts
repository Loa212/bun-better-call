import { createEndpoint, createRouter } from "better-call";
import { z } from "zod";
import { type Todo, todoDb } from "./database";

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
		// Create a new todo item using the database
		return todoDb.createTodo(
			ctx.body.title,
			ctx.body.description,
			ctx.body.done,
		);
	},
);

export const getTodos = createEndpoint(
	"/todos",
	{
		method: "GET",
		query: z.object({ filter: z.string().optional() }),
	},
	async (ctx): Promise<Todo[]> => {
		// Get todos from the database with optional filtering
		return todoDb.getTodos(ctx.query.filter);
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
		const todo = todoDb.getTodoById(ctx.query.id);
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
		const updatedTodo = todoDb.updateTodo(ctx.query.id, {
			title: ctx.query.title,
			description: ctx.query.description,
			done: ctx.query.done,
		});

		if (!updatedTodo) {
			throw new Error("Todo not found");
		}

		return updatedTodo;
	},
);

export const deleteTodo = createEndpoint(
	"/todo",
	{
		method: "DELETE",
		query: z.object({
			id: z.string(),
		}),
	},
	async (ctx): Promise<{ success: boolean }> => {
		const deleted = todoDb.deleteTodo(ctx.query.id);
		if (!deleted) {
			throw new Error("Todo not found");
		}
		return { success: true };
	},
);

export const router = createRouter(
	{
		createTodo,
		getTodos,
		getTodo,
		updateTodo,
		deleteTodo,
	},
	{ basePath: "/api" },
);
