// Server imports...

// Third-party imports
import { Fragment, useState } from 'react'
import Head from 'next/head'

// Custom imports
import { FunFont, HR } from 'components'
import styles from './ErrorTestPage.module.scss'

/* ========================================================================
                                ErrorTestPage
======================================================================== */

const ErrorTestPage = () => {
  const [items, setItems] = useState<any>([])
  /* ======================
          return 
  ====================== */

  return (
    <Fragment>
      <Head>
        <title>Error Test</title>
        <meta name='description' content='Error Test' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main} style={{ minHeight: '100vh' }}>
        <FunFont style={{ margin: '15px auto', textAlign: 'center' }}>
          Error Test
        </FunFont>

        <HR style={{ marginBottom: 50 }} />

        <button
          className='d-block mx-auto mb-5 btn btn-success btn-sm fw-bold'
          onClick={() => {
            setItems(undefined)
          }}
        >
          Break The Page!
        </button>

        {items.map(() => null)}
      </main>
    </Fragment>
  )
}

export default ErrorTestPage
