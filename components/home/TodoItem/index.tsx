// Third-party imports
import { useRouter } from 'next/router'
import useSWRMutation, { MutationFetcher } from 'swr/mutation'
import { mutate } from 'swr'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPencil } from '@fortawesome/free-solid-svg-icons'

// Custom imports
import axios from 'axios'

interface ITodoItem {
  todo: any
}

const updateCompletedField: MutationFetcher<any, any> = async (
  url: string,
  { arg }: { arg: Record<string, any> }
) => {
  const res = await axios.patch(url, arg)

  ///////////////////////////////////////////////////////////////////////////
  //
  // Test rollbackOnError:
  //
  //   if (process.env.NODE_ENV === 'development') {
  //     await sleep(2000)
  //     throw new Error('Whoops! Something went wrong!')
  //   }
  //
  // Note: if res?.data?.data does not exist on the response object,
  // Then it will not trigger rollbackOnError. Rather, it will potentially result
  // in error that is caught by the ErrorBoundary. This can be mitigated
  // by ensuring that all properties picked off of todo use optional
  // chainging -even if they are only one level deep. This will avoid
  // rendering the ErrorBoundary fallback.
  //
  ///////////////////////////////////////////////////////////////////////////

  return res?.data?.data
}

const deleteTodo: MutationFetcher<any, any> = async (url: string) => {
  const res = await axios.delete(url)
  return res?.data?.data
}

/* =============================================================================
-                              TodoItem
============================================================================= */

export const TodoItem = ({ todo }: ITodoItem) => {
  const router = useRouter()
  const { trigger: triggerUpdate, isMutating: isUpdating } = useSWRMutation(
    `/api/todos/${todo?._id}`,
    updateCompletedField,
    {
      onSuccess: (_data, _key, _config) => {
        toast.success('The todo has been updated!')
      },
      onError: (_err, _key, _config) => {
        toast.error('Unable to update the completed status!')
      }
    }
  )

  const { trigger: triggerDelete, isMutating: isDeleting } = useSWRMutation(
    `/api/todos/${todo?._id}`,
    deleteTodo,
    {
      onSuccess: (_data, _key, _config) => {
        toast.success('The todo has been deleted!')
      },
      onError: (_err, _key, _config) => {
        toast.error('Unable to delete the todo!')
      }
    }
  )

  /* ======================
   handleUpdateCompleted()
  ====================== */

  const handleUpdateCompleted = (requestData: any) => {
    // No Validation needed...

    if (!todo?._id) {
      toast.error(
        "The 'todoId' is missing from the call to handleUpdateCompleted()!"
      )
      return
    }

    if (
      typeof requestData !== 'object' ||
      typeof requestData.completed !== 'boolean'
    ) {
      toast.error("The 'completed' value must be a boolean!")
      return
    }
    mutate(
      '/api/todos',
      async (todos: any) => {
        const updatedTodo = await triggerUpdate(requestData)
        const newTodos = todos.map((t: any) => {
          return t._id === todo._id ? updatedTodo : t
        })
        return newTodos
      },
      {
        optimisticData: (todos: any) => {
          const returnData = todos.map((t: any) => {
            if (t._id === todo._id) {
              return { ...todo, completed: !todo?.completed }
            }
            return t
          })
          return returnData
        },

        rollbackOnError: true
        // In theory, we've now updated the cache and there's no
        // reason to revalidate -assuming you're confident in the
        // process. That said, I often feel safer still revalidating.
        // revalidate: false
      }
    )

    ///////////////////////////////////////////////////////////////////////////
    //
    // The Lazy Approach:
    // The previous approach is a very good implementation -especially if you
    // don't intend to revalidate. However, if you definitely want to revalidate
    // then there's a simpler way. It entails immediately mutating todos and NOT
    // revalidating, then updating a specific todo with the triggerUpdate, and
    // on success of that calling mutate() (AGAIN), but this time revalidating.
    //
    // mutate(
    //   '/api/todos',
    //   (todos: any) => {
    //     const newTodos = todos.map((t: any) => {
    //       return t?._id === todo?._id ? { ...todo, completed: !todo?.completed } : t
    //     })
    //     return newTodos
    //   },
    //   { revalidate: false }
    // )
    //
    // triggerUpdate(requestData).then(() => {
    //   console.log("\nCalling mutate('/api/todos') to revalidate.")
    //   mutate('/api/todos')
    // })
    //
    ///////////////////////////////////////////////////////////////////////////
  }

  /* ======================
        handleDelete()
  ====================== */
  // Here I'm just using the simple approach to optimistic updates.

  const handleDelete = () => {
    mutate('/api/todos', (todos: any) => todos.filter((t: any) => t !== todo), {
      revalidate: false
    })
    triggerDelete().then(() => mutate('/api/todos'))
  }

  /* ======================
          return
  ====================== */

  return (
    <li
      className='list-group-item border-primary'
      css={`
        :hover {
          background-color: rgb(240, 240, 240);
        }
      `}
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (
          target.tagName.toLowerCase() === 'button' ||
          target.tagName.toLowerCase() === 'input' ||
          isDeleting
        ) {
          return
        }

        router.push(`/todos/${todo?._id}`)
      }}
      style={{
        alignItems: 'center',
        cursor: 'pointer',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10
      }}
    >
      <input
        className='form-check-input m-0'
        id='completed-check'
        checked={todo?.completed}
        disabled={isUpdating}
        name='completed-check'
        onChange={(e) => {
          handleUpdateCompleted({ completed: e.target.checked })
        }}
        style={{ transform: 'scale(1.25)' }}
        type='checkbox'
      />

      <h6
        className='text-secondary fw-bold m-0'
        style={{ flex: 1, lineHeight: 1 }}
      >
        {todo?.title}
      </h6>

      <div className='btn-group' style={{ alignSelf: 'flex-start' }}>
        <button
          className='btn btn-outline-secondary btn-sm bg-white-unimportant'
          onClick={() => {
            router.push(`/todos/${todo?._id}/update`)
          }}
          title='Edit Todo'
        >
          <FontAwesomeIcon icon={faPencil} style={{ pointerEvents: 'none' }} />
        </button>

        <button
          className='btn btn-outline-danger btn-sm bg-white-unimportant'
          disabled={isDeleting}
          onClick={handleDelete}
          title='Delete Todo'
        >
          <FontAwesomeIcon icon={faTrash} style={{ pointerEvents: 'none' }} />
        </button>
      </div>
    </li>
  )
}
