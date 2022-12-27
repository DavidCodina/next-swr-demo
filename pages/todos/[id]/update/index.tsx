// Server imports
import connectDB from 'utils/db'
import Todo from 'models/todoModel'

// Third-party imports
import { Fragment, useState } from 'react'
import { NextPage, GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useSWRMutation, { MutationFetcher } from 'swr/mutation'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons' // https://github.com/FortAwesome/react-fontawesome

// Custom imports
import { FunFont, HR } from 'components'
import styles from './UpdateTodoPage.module.scss'

const updateTodo: MutationFetcher<any, any> = async (
  url: string,
  { arg }: { arg: Record<string, any> }
) => {
  const res = await axios.patch(url, arg)
  return res?.data
}

/* ========================================================================
-                            UpdateTodoPage
======================================================================== */

const UpdateTodoPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ todo }) => {
  const router = useRouter()
  const { id } = router.query

  const { trigger: triggerUpdate, isMutating: isUpdating } = useSWRMutation(
    `/api/todos/${todo?._id}`,
    updateTodo,
    {
      onSuccess: (_data, _key, _config) => {
        router.push(`/todos/${id}`)
        toast.success('The todo has been updated!')
      }
      // This will not actually catch the error, which is why it's preferable
      // to handle error logic in triggerUpdate().catch(err => { ... })
      // onError: (_err, _key, _config) => {}
    }
  )

  const [title, setTitle] = useState(todo?.title || '')
  const [titleTouched, setTitleTouched] = useState(false)
  const [titleError, setTitleError] = useState('')

  const [body, setBody] = useState(todo?.body || '')
  const [bodyTouched, setBodyTouched] = useState(false)
  const [bodyError, _setBodyError] = useState('')

  const [completed, setCompleted] = useState<boolean>(() => {
    return typeof todo?.completed === 'boolean' ? todo?.completed : false
  })
  const [completedTouched, setCompletedTouched] = useState(false)
  const [completedError, _setCompletedError] = useState('')

  // Derived state - used to conditionally disable submit button
  const isErrors =
    titleError !== '' || bodyError !== '' || completedError !== ''
  const allTouched = titleTouched && bodyTouched && completedTouched

  /* ======================
      validateTitle)
  ====================== */

  const validateTitle = (value?: string) => {
    value = typeof value === 'string' ? value : title
    let error = ''

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      error = 'A title is required.'
      setTitleError(error)
      return error
    }

    setTitleError('')
    return ''
  }

  /* ======================
        validate()
  ====================== */

  const validate = () => {
    const errors: string[] = []

    // Set true on all toucher functions.
    const touchers: React.Dispatch<React.SetStateAction<boolean>>[] = [
      setTitleTouched,
      setBodyTouched,
      setCompletedTouched
    ]

    touchers.forEach((toucher) => {
      toucher(true)
    })

    const validators: (() => string)[] = [
      validateTitle /*, validateBody, validateCompleted */
    ]

    validators.forEach((validator) => {
      const error = validator()
      if (error) {
        errors.push(error)
      }
    })

    // Return early if errors
    if (errors.length >= 1) {
      return { isValid: false, errors: errors }
    }

    return { isValid: true, errors: null }
  }

  /* ======================
        handleUpdate()
  ====================== */

  const handleUpdate = (e: any) => {
    e.preventDefault()

    if (!todo?._id) {
      toast.error(
        "The 'todoId' is missing from the call to handleUpdateCompleted()!"
      )
      return
    }

    const { isValid } = validate()

    // Comment this block out to test server-side validation
    if (!isValid) {
      return
    }

    const requestData = {
      title: title,
      body: body,
      completed: completed
    }

    triggerUpdate(requestData).catch((err) => {
      // In the case of an err, it's generally going to be a
      // server-defined error that is then translated into an AxiosError
      // such that the actual response object will be on err?.response.
      // Then we can pick out the expected form errors as follows -just be sure
      // to code defensively here. Note also that ...response.data assumes that
      // the SWR mutation fetcher is returning the complete response object in this case.

      if (err?.response?.data?.errors) {
        const formErrors = err?.response?.data?.errors

        if (formErrors?.title) {
          setTitleError(formErrors?.title)
        }

        toast.error('Form validation errors found!')
      } else {
        toast.error('Unable to update the todo!')
      }
    })
  }

  /* ======================
    renderUpdateTodoForm()
  ====================== */

  const renderUpdateTodoForm = () => {
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

    return (
      <form
        className='mx-auto mb-3 p-3 border border-primary rounded-3'
        style={{ backgroundColor: '#fafafa', maxWidth: 800 }}
      >
        <div className='mb-3'>
          <label htmlFor='title' className='form-label'>
            Title <sup className='text-danger'>*</sup>
          </label>

          <input
            autoComplete='off'
            className={`form-control form-control-sm${
              !titleTouched ? '' : titleError ? ' is-invalid' : ' is-valid'
            }`}
            id='title'
            name='title'
            onBlur={(e) => {
              if (!titleTouched) {
                setTitleTouched(true)
              }
              validateTitle(e.target.value)
            }}
            onChange={(e) => {
              setTitle(e.target.value)
              validateTitle(e.target.value)
            }}
            placeholder='Title...'
            spellCheck={false}
            type='text'
            value={title}
          />

          <div className='invalid-feedback'>{titleError}</div>
          {/* <div className='valid-feedback'>Looks good!</div> */}
        </div>

        <div className='mb-3'>
          <label htmlFor='body' className='form-label'>
            Body
          </label>

          <textarea
            autoComplete='off'
            className={`form-control form-control-sm${
              !bodyTouched ? '' : bodyError ? ' is-invalid' : ' is-valid'
            }`}
            id='body'
            name='body'
            onBlur={(_e) => {
              if (!bodyTouched) {
                setBodyTouched(true)
              }
              // validateBody(e.target.value)
            }}
            onChange={(e) => {
              setBody(e.target.value)
              // validateBody(e.target.value)
            }}
            placeholder='Optional description...'
            spellCheck={false}
            style={{ height: 150 }}
            value={body}
          />

          <div className='invalid-feedback'>{bodyError}</div>
          {/* <div className='valid-feedback'>Looks good!</div> */}
        </div>

        <div className='form-check mb-3'>
          <input
            className={`form-check-input${
              !completedTouched
                ? ''
                : completedError
                ? ' is-invalid'
                : ' is-valid'
            }`}
            id='completed-check'
            checked={completed}
            disabled={isUpdating}
            name='completed-check'
            onBlur={() => {
              setCompletedTouched(true)
              if (!completedTouched) {
                setCompletedTouched(true)
              }
              // validateCompleted(e.target.value)
            }}
            onChange={() => {
              setCompleted((prevValue) => !prevValue)
              // validateCompleted(e.target.value)
            }}
            style={{ transform: 'scale(1.25)' }}
            type='checkbox'
          />

          <label className='form-check-label fw-bold' htmlFor='completed-check'>
            {completed ? 'Completed' : 'Not Completed'}
          </label>

          <div className='invalid-feedback'>{completedError}</div>
          {/* <div className='valid-feedback'>Looks good!</div> */}
        </div>

        {isUpdating ? (
          <button
            className='d-block w-100 btn btn-success btn-sm fw-bold'
            disabled
            onClick={handleUpdate}
            type='button'
          >
            <span
              aria-hidden='true'
              className='spinner-border spinner-border-sm me-2'
              role='status'
            ></span>
            Updating Todo...
          </button>
        ) : (
          <button
            className='d-block w-100 btn btn-success btn-sm fw-bold'
            // The submit button is disabled here when there are errors, but
            // only when all fields have been touched. All fields will have
            // been touched either manually or after the first time the button
            // has been clicked.
            disabled={allTouched && isErrors ? true : false}
            onClick={handleUpdate}
            type='button'
          >
            {allTouched && isErrors ? (
              <Fragment>
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  style={{ marginRight: 5 }}
                />{' '}
                Please Fix Errors...
              </Fragment>
            ) : (
              'Update Todo'
            )}
          </button>
        )}
      </form>
    )
  }

  /* ======================
          return 
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Update Todo</title>
        <meta name='description' content='Update Todo' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main} style={{ minHeight: '100vh' }}>
        <FunFont style={{ margin: '15px auto', textAlign: 'center' }}>
          Update Todo
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

        {renderUpdateTodoForm()}

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

export default UpdateTodoPage
