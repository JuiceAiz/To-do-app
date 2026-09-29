export interface Todo {
  id: string
  text: string
  /** Optional due date, stored as a local calendar date 'YYYY-MM-DD'. */
  dueDate?: string
  done: boolean
  /** Epoch ms captured when the todo was completed. */
  completedAt?: number
  /** Epoch ms captured when the todo was created. */
  createdAt: number
}
