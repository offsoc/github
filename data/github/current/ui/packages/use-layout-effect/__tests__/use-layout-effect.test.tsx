import {screen} from '@testing-library/react'
import {useLayoutEffect} from '../use-layout-effect'
import {useState} from 'react'
import {render} from '@github-ui/react-core/test-utils'

const Component = () => {
  const [state, setState] = useState('')
  useLayoutEffect(() => {
    setState('ran effect')
  }, [])
  return <div>{state}</div>
}
test('Renders the useIsomorphicLayoutEffect hook', async () => {
  render(<Component />)
  expect(await screen.findByText('ran effect')).toBeInTheDocument()
})
