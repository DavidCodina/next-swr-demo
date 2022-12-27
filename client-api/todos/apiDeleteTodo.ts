import axios from 'axios'
import { getErrorMessage } from 'utils'

/* ========================================================================
                            apiDeleteTodo()                 
======================================================================== */

export const apiDeleteTodo = async (todoId: string) => {
  try {
    const res = await axios.delete(`/api/todos/${todoId}`)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to delete todo!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
