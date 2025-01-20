import {render, screen} from '@testing-library/react'
import {StatusCheckRow} from '../StatusCheckRow'

test('status check row does not include links when target URL is null', () => {
  render(<StatusCheckRow displayName="Check" description="Description" state="SUCCESS" targetUrl={undefined} />)
  expect(screen.getByText('Check')).toBeInTheDocument()
  expect(screen.getByText('Description')).toBeInTheDocument()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})
