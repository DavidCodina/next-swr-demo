import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'
import connectDB from 'utils/db'
import Todo from 'models/todoModel'
type Data = any

/* ========================================================================
                          handler()
======================================================================== */
// [id].ts handles GET, PATCH, and DELETE requests for single todos.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query

  if (['GET', 'PATCH', 'DELETE'].indexOf(req.method as string) === -1) {
    return res
      .setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
      .status(405) // 405 : Method not allowed
      .json({
        data: null,
        message: `The ${req.method} method is not allowed for this endpoint!`,
        success: false
      })
  }

  // Unlikely since it will be part of the URL, but just in case.
  if (!id) {
    return res.status(400).json({
      data: null,
      message: "The 'id' is required!",
      success: false
    })
  }

  if (!ObjectId.isValid(id as string)) {
    return res.status(400).json({
      data: null,
      message: "The 'id' ObjectId format is invalid!",
      success: false
    })
  }

  try {
    await connectDB()

    const todo = await Todo.findById(id).exec()

    if (!todo) {
      return res.status(404).json({
        data: null,
        message: 'Todo not found!',
        success: false
      })
    }

    /* ======================
          GET Request
    ====================== */

    if (req.method === 'GET') {
      return res.status(200).json({
        data: todo,
        message: 'Request successful!',
        success: true
      })
    }

    /* ======================
          PATCH Request
    ====================== */

    if (req.method === 'PATCH') {
      console.log('The PATCH request was hit.', req.body)

      const { title, body, completed } = req.body

      //# We also need to check the uniqueness of the title...
      if (typeof title === 'string' && title.trim() === '') {
        return res.status(400).json({
          data: null,
          message: 'Request failed!',
          success: false,
          errors: {
            title: 'A title is required. (Server)'
          }
        })
      }

      if (typeof title === 'string') {
        todo.title = title
      }

      if (typeof body === 'string') {
        todo.body = body
      }

      if (typeof completed === 'boolean') {
        console.log('completed: ', completed)
        todo.completed = completed
      }

      const updatedTodo = await todo.save()

      return res.status(200).json({
        data: updatedTodo,
        message: 'Todo updated!',
        success: true
      })
    }

    /* ======================
          DELETE Request
    ====================== */

    if (req.method === 'DELETE') {
      const result = await todo.remove()

      return res.status(200).json({
        data: null,
        message: `The todo with in id of '${result._id}' was deleted!`,
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
