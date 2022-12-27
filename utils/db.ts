import mongoose from 'mongoose'

/* =============================================================================
                                connectDB
============================================================================= */
// https://gale.udemy.com/course/nextjs-ecommerce/learn/lecture/32434486#overview
// The Basir Udemy tutorial, video 15 at 5:30 had a few extra bits of logic.
// It solves the issue of having multiple connections by using a previous
// connection if one exists already. Note, the implementation used here is
// a modification of that.

const connectDB = async () => {
  let readyState = 0

  if (mongoose?.connections?.length > 0) {
    readyState = mongoose?.connections[0]?.readyState
  }

  if (readyState === 1) {
    console.log('\nA previous connection was detected. Using that.')
    // The return value of connection and the value of mongoose are the same thing. Thus: connection === mongoose would be true.
    return mongoose
  }
  try {
    // Probably not really necessary, but it avoids the possibility of other
    // connections being in a readyState of 2 (connecting) or 3 (disconnecting).
    await mongoose.disconnect()

    console.log(
      '\nA previous connection was not detected. A new one is being created.'
    )
    const connection = await mongoose.connect(process.env.MONGO_URI!)
    readyState = connection?.connections[0]?.readyState
    console.log(`\nMongoDB Connected: ${connection.connection.host}.`)

    return connection
  } catch (err) {
    console.log(
      '\nMongoDB failed to connect, but the err was caught from within /utils/db.ts.'
    )

    if (process.env.NODE_ENV === 'development') {
      console.log(err)
    }
    return err
  }
}

/* ======================
      disconnectDB()
====================== */
// The Basir Udemy tutorial, video 15 also implements a disconnectDB() abstraction.
// This abstraction opts out of disconnection during development. Why? Because
// connecting/disconnecting for every change in the code 'consumes the process'
// Here is a version of that function. However, I'm not using it.
// Moreover, it doesn't seem to me that there's even a need for disconnecting from
// individual API requests because we're already preventing multiple connections, etc.

// export async function disconnectDB() {
//   let readyState = 0

//   if (mongoose?.connections?.length > 0) {
//     readyState = mongoose?.connections[0]?.readyState
//   }

//   if (readyState === 1) {
//     if (process.env.NODE_ENV === 'production') {
//       await mongoose.disconnect()
//     } else {
//       console.log(
//         'disconnectDB() was called, but does not disconnect during development.'
//       )
//     }
//   }
// }

export default connectDB
