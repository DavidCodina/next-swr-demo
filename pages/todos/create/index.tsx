// Server imports...

// Third-party imports
import { Fragment, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useSWRMutation, { MutationFetcher } from 'swr/mutation'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons' // https://github.com/FortAwesome/react-fontawesome

// Custom imports
import { FunFont, HR } from 'components'
import styles from './CreateTodoPage.module.scss'

const createTodo: MutationFetcher<any, any> = async (
  url: string,
  { arg }: { arg: Record<string, any> }
) => {
  const res = await axios.post(url, arg)
  return res?.data
}

/* ========================================================================
                              CreateTodoPage
======================================================================== */

const CreateTodoPage = () => {
  const router = useRouter()

  const { trigger: triggerCreate, isMutating: isCreating } = useSWRMutation(
    '/api/todos',
    createTodo,
    {
      onSuccess: (_data, _key, _config) => {
        router.push('/')
        toast.success('The todo has been created!')
      }

      // This will not actually catch the error, which is why it's preferable
      // to handle error logic in triggerCreate().catch(err => { ... })
      // onError: (_err, _key, _config) => {}
    }
  )

  const [title, setTitle] = useState('')
  const [titleTouched, setTitleTouched] = useState(false)
  const [titleError, setTitleError] = useState('')

  const [body, setBody] = useState('')
  const [bodyTouched, setBodyTouched] = useState(false)
  const [bodyError, _setBodyError] = useState('')

  // Derived state - used to conditionally disable submit button
  const isErrors = titleError !== '' || bodyError !== ''
  const allTouched = titleTouched && bodyTouched

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
      setBodyTouched
    ]

    touchers.forEach((toucher) => {
      toucher(true)
    })

    const validators: (() => string)[] = [validateTitle /*, validateBody */]

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
      handleDeleteTodo()
  ====================== */

  const handleCreateTodo = (e: any) => {
    e.preventDefault()

    const { isValid } = validate()

    // Comment this block out to test server-side validation
    if (!isValid) {
      return
    }

    const requestData = { title, body }
    triggerCreate(requestData).catch((err) => {
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
        toast.error('Unable to create the todo!')
      }
    })
  }

  /* ======================
      renderCreateTodoForm()
    ====================== */

  const renderCreateTodoForm = () => {
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

        {isCreating ? (
          <button
            className='d-block w-100 btn btn-success btn-sm fw-bold'
            disabled
            type='button'
          >
            <span
              aria-hidden='true'
              className='spinner-border spinner-border-sm me-2'
              role='status'
            ></span>
            Creating Todo...
          </button>
        ) : (
          <button
            className='d-block w-100 btn btn-success btn-sm fw-bold'
            // The submit button is disabled here when there are errors, but
            // only when all fields have been touched. All fields will have
            // been touched either manually or after the first time the button
            // has been clicked.
            disabled={allTouched && isErrors ? true : false}
            onClick={handleCreateTodo}
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
              'Create Todo'
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
        <title>Create Todo</title>
        <meta name='description' content='Create Todo' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main} style={{ minHeight: '100vh' }}>
        <FunFont style={{ margin: '15px auto', textAlign: 'center' }}>
          Create Todo
        </FunFont>

        <HR style={{ marginBottom: 50 }} />

        {renderCreateTodoForm()}

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

export default CreateTodoPage
