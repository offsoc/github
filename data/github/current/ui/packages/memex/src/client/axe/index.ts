/**
 * Call to generate accessibility violations on load
 * and again after every push/replaceState call
 *
 * You can also call window.runAxeCheck() to run the check manually
 * in development
 */
export async function setupAxe() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Axe is only available in development mode')
  }
  const [{default: React}, ReactDOM, {default: axe}] = await Promise.all([
    import('react'),
    import('react-dom'),
    import('@axe-core/react'),
  ])

  const run = () =>
    axe(React, ReactDOM, 1000, undefined, {
      exclude: ['#nav-root'],
    })
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('Axe check complete')
      })
      // eslint-disable-next-line no-console
      .catch(console.error)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  window.history.pushState = new Proxy(window.history.pushState, {
    apply(target, thisArg, argumentsList: Parameters<typeof window.history.pushState>) {
      run()
      return Reflect.apply(target, thisArg, argumentsList)
    },
  })
  // eslint-disable-next-line @typescript-eslint/unbound-method
  window.history.replaceState = new Proxy(window.history.replaceState, {
    apply(target, thisArg, argumentsList: Parameters<typeof window.history.replaceState>) {
      run()
      return Reflect.apply(target, thisArg, argumentsList)
    },
  })

  window.runAxeCheck = run

  run()
}

declare global {
  interface Window {
    runAxeCheck: () => Promise<void>
  }
}
