import axios from 'axios'
import { getErrorMessage } from 'utils'

/* ========================================================================
                            apiGetTodos()                 
======================================================================== */

export const apiGetTodos = async () => {
  try {
    const res = await axios.get('/api/todos')

    return {
      ...res.data,
      status: res.status || 200
    }
  } catch (err: any) {
    return Promise.reject({
      data: null,
      message: getErrorMessage(err, 'Unable to get todos!'),
      status: err?.response?.status || 500,
      success: false
    })
  }
}
