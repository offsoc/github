import {useState} from 'react'
import type {BrowserHistory, MemoryHistory} from '@remix-run/router'
import {Router} from 'react-router-dom'
// eslint-disable-next-line no-restricted-imports
import {useHydratedEffect} from '@github-ui/use-hydrated-effect'

type Props = {
  children: React.ReactNode
  history: BrowserHistory | MemoryHistory
}

export function PartialRouter({children, history}: Props) {
  const [state, setState] = useState({
    location: history.location,
  })

  useHydratedEffect(() => history.listen(setState), [history])

  return (
    <Router location={state.location} navigator={history}>
      {children}
    </Router>
  )
}
