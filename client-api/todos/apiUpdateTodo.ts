import axios from 'axios'
import { getErrorMessage } from 'utils'

/* ========================================================================
                            apiUpdateTodo()                 
======================================================================== */

export const apiUpdateTodo = async (todoId: any, data: any) => {
  try {
    const res = await axios.patch(`/api/todos/${todoId}`, data)

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to create todo!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
