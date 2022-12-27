import axios from 'axios'
import { getErrorMessage } from 'utils'

/* ========================================================================
                            apiGetTodo()                 
======================================================================== */

export const apiGetTodo = async (todoId: any) => {
  try {
    const res = await axios.get(`/api/todos/${todoId}`)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to get todo!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
