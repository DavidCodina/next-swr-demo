import { Schema, model, models } from 'mongoose'

/* ======================
      todoModel
====================== */

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    body: {
      type: String
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

const Todo = models.Todo || model('Todo', todoSchema)
export default Todo
