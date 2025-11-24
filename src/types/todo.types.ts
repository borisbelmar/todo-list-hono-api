export interface Location {
  latitude: number
  longitude: number
}

export interface Todo {
  id: string
  userId: string
  title: string
  completed: boolean
  location?: Location
  photoUri?: string
  createdAt: string
  updatedAt: string
}

export type CreateTodoInput = Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
export type UpdateTodoInput = Partial<CreateTodoInput>
