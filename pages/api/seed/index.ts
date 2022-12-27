import Todo from 'models/todoModel'
import connectDB from 'utils/db'
import data from './data'

/* =============================================================================

============================================================================= */

const handler = async (req: any, res: any) => {
  try {
    const connection: any = await connectDB()
    await Todo.deleteMany()
    const todos = await Todo.insertMany(data.todos)
    await connection.disconnect()

    res.status(200).json({
      data: todos,
      message: 'Seeded successfully',
      success: true
    })
  } catch (err: any) {
    console.log(err)
    res.status(500).json({
      data: null,
      message: err.message || 'Seeding failed',
      success: false
    })
  }
}

export default handler
