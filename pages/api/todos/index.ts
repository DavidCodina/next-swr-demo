import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from 'utils/db'
import Todo from 'models/todoModel'
type Data = any

/* ========================================================================
                               handler()
======================================================================== */
// index.ts handles GET requests for all todos, and POST
// (create) requests to make new todos.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (['GET', 'POST'].indexOf(req.method as string) === -1) {
    return res
      .setHeader('Allow', ['GET', 'POST'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false
      })
  }

  try {
    await connectDB()

    /* ======================
          GET Request
    ====================== */

    if (req.method === 'GET') {
      const todos = await Todo.find().sort({ createdAt: -1 }).lean().exec()

      // If we're connecting to MongoDB through mongoose, then even if there are
      // no results it will still return []. That said, this is still a good practice.
      if (!todos) {
        return res.status(404).json({
          data: null,
          message: 'Todos not found!',
          success: false
        })
      }

      return res.status(200).json({
        data: todos,
        message: 'Request successful!',
        success: true
      })
    }

    /* ======================
          POST Request
    ====================== */

    if (req.method === 'POST') {
      const { title = '', body = '' } = req.body

      // Validation...
      if (!title || (typeof title === 'string' && title.trim() === '')) {
        return res.status(400).json({
          data: null,
          message: 'Request failed!',
          success: false,
          errors: {
            title: 'A title is required. (Server)'
          }
        })
      }

      const newTodo = new Todo({
        title: title,
        body: body
      })

      const savedTodo = await newTodo.save()

      return res.status(201).json({
        data: savedTodo,
        message: 'Request successful!',
        success: true
      })
    }
  } catch (err: any) {
    return res.status(500).json({
      data: null,
      message: err?.message ? err.message : 'Request failed!',
      success: false
    })
  }
}
