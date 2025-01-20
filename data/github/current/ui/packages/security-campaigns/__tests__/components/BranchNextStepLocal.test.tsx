import {screen} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {BranchNextStepLocal, type BranchNextStepLocalProps} from '../../components/BranchNextStepLocal'

const onClose = jest.fn()
const branch = 'branch-name'

const render = (props?: Partial<BranchNextStepLocalProps>) =>
  reactRender(<BranchNextStepLocal branch={branch} onClose={onClose} {...props} />)

beforeEach(() => {
  onClose.mockReset()
})

it('shows the correct text', async () => {
  render()
  const text = screen.getByText(`git fetch origin git checkout ${branch}`)
  expect(text).toBeInTheDocument()
})
