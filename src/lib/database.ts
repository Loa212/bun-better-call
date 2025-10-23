import { Database } from "bun:sqlite";

export type Todo = {
	id: string;
	title: string;
	description?: string;
	done?: boolean;
};

class TodoDatabase {
	private db: Database;

	constructor(filename: string = "todos.sqlite") {
		this.db = new Database(filename, { create: true });

		// Enable WAL mode for better performance
		this.db.exec("PRAGMA journal_mode = WAL;");

		this.initializeTables();
		this.seedInitialData();
	}

	private initializeTables() {
		// Create todos table if it doesn't exist
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS todos (
				id TEXT PRIMARY KEY,
				title TEXT NOT NULL,
				description TEXT,
				done INTEGER DEFAULT 0,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);
	}

	private seedInitialData() {
		// Check if we already have data
		const count = this.db
			.query("SELECT COUNT(*) as count FROM todos")
			.get() as { count: number };

		if (count.count === 0) {
			// Insert initial todos
			const insertTodo = this.db.prepare(`
				INSERT INTO todos (id, title, description, done) 
				VALUES (?, ?, ?, ?)
			`);

			const initialTodos = [
				{
					id: crypto.randomUUID(),
					title: "Learn TypeScript",
					description: "Understand the basics of TypeScript.",
					done: false,
				},
				{
					id: crypto.randomUUID(),
					title: "Build a REST API",
					description: "Create a simple REST API using Node.js and Express.",
					done: true,
				},
			];

			const insertTransaction = this.db.transaction(
				(todos: typeof initialTodos) => {
					for (const todo of todos) {
						insertTodo.run(
							todo.id,
							todo.title,
							todo.description,
							todo.done ? 1 : 0,
						);
					}
				},
			);

			insertTransaction(initialTodos);
		}
	}

	// Create a new todo
	createTodo(title: string, description?: string, done: boolean = false): Todo {
		const id = crypto.randomUUID();
		const insertQuery = this.db.prepare(`
			INSERT INTO todos (id, title, description, done) 
			VALUES (?, ?, ?, ?)
		`);

		insertQuery.run(id, title, description || null, done ? 1 : 0);

		return {
			id,
			title,
			description,
			done,
		};
	}

	// Get all todos with optional filtering
	getTodos(filter?: string): Todo[] {
		if (filter) {
			const query = this.db.prepare(`
				SELECT id, title, description, done 
				FROM todos 
				WHERE title LIKE ? 
				ORDER BY created_at DESC
			`);
			const rows = query.all(`%${filter}%`) as Array<{
				id: string;
				title: string;
				description: string | null;
				done: number;
			}>;

			return rows.map((row) => ({
				id: row.id,
				title: row.title,
				description: row.description || undefined,
				done: Boolean(row.done),
			}));
		} else {
			const query = this.db.prepare(`
				SELECT id, title, description, done 
				FROM todos 
				ORDER BY created_at DESC
			`);
			const rows = query.all() as Array<{
				id: string;
				title: string;
				description: string | null;
				done: number;
			}>;

			return rows.map((row) => ({
				id: row.id,
				title: row.title,
				description: row.description || undefined,
				done: Boolean(row.done),
			}));
		}
	}

	// Get a single todo by ID
	getTodoById(id: string): Todo | undefined {
		const query = this.db.prepare(`
			SELECT id, title, description, done 
			FROM todos 
			WHERE id = ?
		`);

		const row = query.get(id) as
			| {
					id: string;
					title: string;
					description: string | null;
					done: number;
			  }
			| undefined;

		if (!row) return undefined;

		return {
			id: row.id,
			title: row.title,
			description: row.description || undefined,
			done: Boolean(row.done),
		};
	}

	// Update a todo
	updateTodo(
		id: string,
		updates: {
			title?: string;
			description?: string;
			done?: boolean;
		},
	): Todo | undefined {
		const existingTodo = this.getTodoById(id);
		if (!existingTodo) return undefined;

		const updatedTodo = {
			...existingTodo,
			...updates,
		};

		const updateQuery = this.db.prepare(`
			UPDATE todos 
			SET title = ?, description = ?, done = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`);

		updateQuery.run(
			updatedTodo.title,
			updatedTodo.description || null,
			updatedTodo.done ? 1 : 0,
			id,
		);

		return updatedTodo;
	}

	// Delete a todo
	deleteTodo(id: string): boolean {
		const deleteQuery = this.db.prepare("DELETE FROM todos WHERE id = ?");
		const result = deleteQuery.run(id);
		return result.changes > 0;
	}

	// Close the database connection
	close() {
		this.db.close();
	}
}

// Create and export a singleton instance
export const todoDb = new TodoDatabase();

// Export the class for testing or multiple instances if needed
export { TodoDatabase };
