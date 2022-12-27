// Server imports...

// Third-party imports
import { Fragment } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useSWR from 'swr'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'

// Custom imports
import { TodoItem, FunFont, HR, Spinner, Waves } from 'components'
import { getErrorMessage } from 'utils'
import styles from 'styles/HomePage.module.scss'

/* ========================================================================
                                HomePage
======================================================================== */

const HomePage = () => {
  const router = useRouter()

  const {
    data: todos,
    error: todosError,
    isLoading: todosLoading
  } = useSWR('/api/todos')

  /* ======================
       renderTodos()
  ====================== */

  const renderTodos = () => {
    // 0. If you wanted to prefetch with getServerSideProps, you could add this step.
    // if (!todos && !todosError && todosProp) {
    //   return (
    //     <ul
    //       className='list-group mx-auto shadow-sm'
    //       style={{ fontSize: 14, maxWidth: 800 }}
    //     >
    //       {todosProp.map((todo: any) => {
    //         return (
    //           <TodoItem
    //             key={todo?._id}
    //             todo={todo}
    //             // Initially, I was doing this, but we can instead call mutate('/api/todos')
    //             // directly from within TodoItem.
    //             // onTodosChange={() => {
    //             //   // If you import { mutate } from 'swr', you have to pass the key
    //             //   // (i.e., '/api/todos'). However if you pull it off of useSWR(),
    //             //   // you don't
    //             //   mutate()
    //             // }}
    //           />
    //         )
    //       })}
    //     </ul>
    //   )
    // }

    // 1.
    if (todosError) {
      return (
        <div
          className='alert alert-danger border border-danger rounded-3 shadow-sm'
          style={{ fontSize: 14 }}
        >
          {process.env.NODE_ENV === 'development' ? (
            <div>{getErrorMessage(todosError, 'Unable to get todos!')}</div>
          ) : (
            <div>Whoops! There was a problem getting the todos! (1)</div>
          )}
        </div>
      )
    }

    // 2.
    if (todosLoading) {
      return (
        <Spinner
          containerStyle={{
            display: 'flex',
            justifyContent: 'center'
          }}
          style={{}}
          variant='primary'
        />
      )
    }

    // 3. At this point, we can reasonably assume that todos is not undefined
    // or otherwise falsy. Nonetheless, we should still code defensively.
    if (todos) {
      // Make sure the data is an array.
      if (!Array.isArray(todos)) {
        console.log('todos is', todos)
        return (
          <div
            className='alert alert-danger border border-danger rounded-3 shadow-sm'
            style={{ fontSize: 14 }}
          >
            <div>Whoops! There was a problem getting the todos! (2)</div>
          </div>
        )
      }

      // If it is an array, but no results then do this.
      if (todos.length === 0) {
        return (
          <div
            className='alert alert-info border border-info rounded-3 shadow-sm'
            style={{ fontSize: 14 }}
          >
            <div>
              It seems that there are no todos! This is a great time to create
              one!
            </div>
          </div>
        )
      }

      // Otherwise, map out the todos
      return (
        <ul
          className='list-group mx-auto shadow-sm'
          style={{ fontSize: 14, maxWidth: 800 }}
        >
          {todos.map((todo: any) => {
            return <TodoItem key={todo?._id} todo={todo} />
          })}
        </ul>
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
        <title>Todos</title>
        <meta name='description' content='Todos' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main} style={{ minHeight: '100vh' }}>
        <FunFont style={{ margin: '15px auto', textAlign: 'center' }}>
          Todos
        </FunFont>

        <HR style={{ marginBottom: 50 }} />

        <button
          className='d-block mx-auto btn btn-success btn-sm fw-bold shadow-sm'
          onClick={() => router.push('/todos/create')}
          style={{
            marginBottom: 25,
            minWidth: 150
          }}
        >
          <FontAwesomeIcon
            icon={faPlusCircle}
            style={{ marginRight: 5, pointerEvents: 'none' }}
          />
          Create Todo
        </button>

        {renderTodos()}

        <Waves />
      </main>
    </Fragment>
  )
}

export default HomePage
