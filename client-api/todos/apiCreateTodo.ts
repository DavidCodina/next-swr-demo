import axios from 'axios'
import { getErrorMessage } from 'utils'

/* ========================================================================
                            apiCreateTodo()                 
======================================================================== */

export const apiCreateTodo = async (data: any) => {
  try {
    const res = await axios.post('/api/todos', data)

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
