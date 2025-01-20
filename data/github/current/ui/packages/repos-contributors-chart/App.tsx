import type {ReactNode} from 'react'

type AppProps = {
  children?: ReactNode
}

export function App({children}: AppProps) {
  return <div>{children}</div>
}
