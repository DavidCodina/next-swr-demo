// Server imports...

// Third-party imports
import { Fragment } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useSWR from 'swr'
import useSWRMutation, { MutationFetcher } from 'swr/mutation'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'

// Custom imports
import { FunFont, HR, Spinner } from 'components'
import { getErrorMessage } from 'utils'
import styles from './TodoDetailsPage.module.scss'

const deleteTodo: MutationFetcher<any, any> = async (url: string) => {
  const res = await axios.delete(url)
  return res?.data?.data
}

/* ========================================================================
-                            TodoDetailsPage
======================================================================== */
///////////////////////////////////////////////////////////////////////////
//
// In this case, there's not a lot of reason to implement SWR for the initial
// GET request when the data can just as easily be prefetched. That said,
// let's pretend that the details page is a product or stock. In such cases,
// we'd want to use some of the automatic revalidation and/or caching that SWR
// provides, so for that reason I'm going to implement SWR on the GET request.
// just for the heck of it.
//
///////////////////////////////////////////////////////////////////////////

const TodoDetailsPage = () => {
  const router = useRouter()
  const { id } = router.query

  const {
    data: todo,
    error: todoError,
    isLoading: todoLoading
  } = useSWR(`/api/todos/${id}`)

  const { trigger: triggerDelete, isMutating: isDeleting } = useSWRMutation(
    // The destrctured todo will be undefined on the initial mount.
    `/api/todos/${todo?._id}`,
    deleteTodo,
    {
      onSuccess: async () => {
        router.push('/')
        toast.success('The todo has been deleted!')
      },

      onError: (_err, _key, _config) => {
        toast.error('Unable to delete the todo!')
      }
    }
  )

  /* ======================
        handleDelete()
  ====================== */

  const handleDelete = () => {
    // Here, there's no reason to do an optimistic update because we are immediately
    // redirecting the user. The page change itself will reload the data.
    triggerDelete()
  }

  /* ======================
       renderTodo()
  ====================== */

  const renderTodo = () => {
    // 1.
    if (todoError) {
      return (
        <div
          className='alert alert-danger border border-danger rounded-3 shadow-sm'
          style={{ fontSize: 14 }}
        >
          {process.env.NODE_ENV === 'development' ? (
            <div>{getErrorMessage(todoError, 'Unable to get todo!')}</div>
          ) : (
            <div>Whoops! There was a problem getting the todo!</div>
          )}
        </div>
      )
    }

    // 2.
    if (todoLoading) {
      return (
        <Spinner
          containerStyle={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 15
          }}
          style={{}}
          variant='primary'
        />
      )
    }

    // 3. Handle todo being falsy. This is unlikly, but just in case.
    if (!todo) {
      return (
        <div
          className='alert alert-danger border border-danger rounded-3 shadow-sm'
          style={{ fontSize: 14 }}
        >
          <div>Whoops! There was a problem getting the todo!</div>
        </div>
      )
    }

    // 4.
    if (todo) {
      return (
        <div
          className='mx-auto mb-3 p-3 shadow-sm border border-primary rounded-3'
          style={{ backgroundColor: '#fafafa', fontSize: 14, maxWidth: 800 }}
        >
          <h5 className='text-secondary fw-bold'>{todo?.title}:</h5>

          <h6
            className='text-secondary fw-bold'
            style={{ fontSize: 14, marginBottom: 25 }}
          >
            Completed:{' '}
            <span className={todo?.completed ? 'text-success' : 'text-danger'}>
              {todo?.completed?.toString()}
            </span>
          </h6>

          {todo?.body && <p> {todo?.body}</p>}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className='btn-group'>
              <button
                className='btn btn-outline-secondary btn-sm bg-white-unimportant fw-bold'
                onClick={() => {
                  router.push(`/todos/${todo._id}/update`)
                }}
                style={{ minWidth: 150 }}
                title='Edit Todo'
              >
                <FontAwesomeIcon
                  icon={faPencil}
                  style={{ marginRight: 5, pointerEvents: 'none' }}
                />
                Edit Todo
              </button>

              <button
                className='btn btn-outline-danger btn-sm bg-white-unimportant fw-bold'
                disabled={isDeleting}
                onClick={handleDelete}
                style={{ minWidth: 150 }}
                title='Delete Todo'
              >
                <FontAwesomeIcon
                  icon={faTrash}
                  style={{ marginRight: 5, pointerEvents: 'none' }}
                />
                Delete Todo
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Fallback just in case something super weird happens
    // like res.data.data doesn't exist in the response object.
    return null
  }

  /* ======================
          return 
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Todo</title>
        <meta name='description' content='Todo' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main} style={{ minHeight: '100vh' }}>
        <FunFont style={{ margin: '15px auto', textAlign: 'center' }}>
          Todo
        </FunFont>

        {id && (
          <h5
            className='fw-bold text-center outline-strong outline-secondary outline-width-1 outline-shadow'
            style={{
              margin: '-10px auto 25px auto'
            }}
          >
            {id && ` ${id}`}
          </h5>
        )}

        <HR style={{ marginBottom: 50 }} />

        {renderTodo()}

        <button
          className='d-block mx-auto btn btn-primary btn-sm fw-bold shadow-sm'
          onClick={() => router.push('/')}
          style={{ minWidth: 300 }}
        >
          Back To Todos
        </button>
      </main>
    </Fragment>
  )
}

/* ======================
  getServerSideProps()
====================== */

/*
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id }: any = context.params

  try {
    await connectDB()

    let todo = await Todo.findById(id).lean().exec()

    if (!todo) {
      return {
        props: {
          todo: null
        }
      }
    }

    todo = JSON.parse(JSON.stringify(todo))

    return {
      props: {
        todo: todo
      }
    }
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err.message)
    }
    return {
      props: {
        todos: null
      }
    }
  }
}
*/

export default TodoDetailsPage
