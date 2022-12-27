/** @type {import('next').NextConfig} */

// Make sure to export the config: https://nextjs.org/docs/messages/empty-configuration
// Otherwise, you may get: Detected next.config.js, no exported configuration found.
module.exports = {
  ///////////////////////////////////////////////////////////////////////////
  //
  // We can set env variables here. I've seen mention that this was the legacy approach
  // to exposing env variables to the client. However, you can now prepend NEXT_PUBLIC_ to
  // any variable you want to make public. Moreover, we can differntiate betwe dev/prod
  // variables by using .env.development and .env.production in addition to .env.local.
  // The option of defining environment variables here is more of a legacy approach.
  //
  // It may also always make these variables public, so double-check that before defining
  // any sensitive data here.
  //
  // Maximillian Udemy tutorial, video 210 at 11:30.
  // Coding Academent Udemy tutorial, video 40 at 9:45.
  // In such a legacy approach, in order to differentiate between production values and
  // development values we would do something like this:
  //
  //   const {PHASE_DEVELOPMENT_SERVER, PHASE_EXPORT, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER  } = require('next/constants')
  //
  //   module.exports = (phase, { defaultConfig }) => {
  //     if (phase === PHASE_DEVELOPMENT_SERVER) {
  //       return { ... } // return dev config
  //     }
  //     return {} // return prod config
  //   }
  //
  // The Maximillian Udemy tutorial, video 213 addresses the potential security issue
  // of including this file in our GitHub repo. We do need to leave this file in the repo.
  // It will be needed by Vercel or other hosting platforms, so how do we get around the
  // issue of not exposing sensitive variables? First, if it were a private repo it wouldn't
  // matter, but let's suppose it's public, or maybe we don't want other team members to view it.
  // Maximillian says that we can omit it if there's a potential security risk.
  // And in this case, we'd simply set the environment variables in the hosting platform's
  // settings. In any case, this is what I'm already doing.
  //
  ///////////////////////////////////////////////////////////////////////////

  // env: {},
  reactStrictMode: true,
  // swcMinify: true,
  // ssr and displayName are configured by default
  compiler: { styledComponents: true },

  // https://stackoverflow.com/questions/65487914/error-image-optimization-using-next-js-default-loader-is-not-compatible-with-n
  // next/images don't work with static pages (generated with next export)
  // For static pages use this image-optimizer : next-optimized-images instead
  // Simply doing this didn't work for me.
  // images: { unoptimized: true }

  // Tell NextJS that Cloudinary is okay.
  // Pre 12.3.0 you would only have to do this images: { domains: ['res.cloudinary.com'] }
  // https://vercel.com/docs/concepts/image-optimization/remote-images
  // https://nextjs.org/docs/messages/next-image-unconfigured-host
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dva7tsqq3/**' // '/dva7tsqq3/image/upload/v1668712301/blogs'
      }
    ]
  }
}
