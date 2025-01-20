import {RepoPicker} from '../RepoPicker'
import {screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import type {BaseRepo} from '../types'
import {
  clickMenuItem,
  clickPickerButton,
  openList,
  openPicker,
  setupIntersectionObserverMock,
  setupResizeObserverMock,
} from './test-utils'
import type {ComponentProps} from 'react'

interface Props {
  initialSelected?: ComponentProps<typeof RepoPicker>['initialSelected']
  queryFn?: ComponentProps<typeof RepoPicker.PickerButton>['queryFn']
}

const defaultQueryFn = jest.fn().mockReturnValue([])

const repo: BaseRepo = {
  isInOrganization: true,
  name: 'repo1',
  nameWithOwner: 'org/repo1',
  owner: {
    avatarUrl: '',
  },
}

const repo1 = {...repo, name: 'repo1', nameWithOwner: 'org/repo1'}
const repo2 = {...repo, name: 'repo2', nameWithOwner: 'org/repo2'}

const renderComponent = ({initialSelected, queryFn = defaultQueryFn}: Props = {}) => {
  return render(
    <RepoPicker initialSelected={initialSelected}>
      <RepoPicker.PickerButton queryFn={queryFn} />

      <RepoPicker.ListButton />
    </RepoPicker>,
  )
}

// Prevents the following error:
// TypeError: observer.observe is not a function
beforeEach(() => {
  setupIntersectionObserverMock()
  setupResizeObserverMock()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('RepoPicker', () => {
  describe('All vs Selected overlay', () => {
    describe('selecting All', () => {
      it('deselects all repos and closes the overlay', async () => {
        const queryFn = jest.fn().mockReturnValue([repo1, repo2])
        renderComponent({initialSelected: [repo1], queryFn})

        await clickPickerButton()
        await clickMenuItem('all')

        await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
        await waitFor(() => expect(screen.queryByText('Repositories: 1 selected')).not.toBeInTheDocument())
      })
    })
  })

  describe('PickerDialog', () => {
    describe('initial state', () => {
      it('calls queryFn with an empty string call when opened', async () => {
        const queryFn = jest.fn().mockReturnValue([])
        renderComponent({queryFn})

        await openPicker()

        expect(queryFn).toHaveBeenCalledWith('')
      })

      it('has previously selected repos already selected', async () => {
        const queryFn = jest.fn().mockReturnValue([repo1])
        renderComponent({initialSelected: [repo1], queryFn})

        await openPicker()

        await waitFor(async () => expect(await screen.findByText(repo1.nameWithOwner)).toBeInTheDocument())
        expect(screen.getByLabelText(`Select: ${repo1.nameWithOwner}`)).toBeChecked()
      })
    })

    describe('selecting', () => {
      it('updates ListButton', async () => {
        const queryFn = jest.fn().mockReturnValue([repo1, repo2])
        const {user} = renderComponent({initialSelected: [repo1], queryFn})

        await openPicker()
        await waitFor(async () => expect(await screen.findByText(repo1.nameWithOwner)).toBeInTheDocument())

        await user.click(screen.getByLabelText(`Select: ${repo2.nameWithOwner}`))

        await user.click(await screen.findByRole('button', {name: 'Apply'}))

        expect(screen.getByText('Repositories: 2 selected')).toBeInTheDocument()
      })
    })

    describe('deselecting', () => {
      it('updates ListButton', async () => {
        const queryFn = jest.fn().mockReturnValue([repo1, repo2])
        const {user} = renderComponent({initialSelected: [repo1, repo2], queryFn})

        await openPicker()
        await waitFor(async () => expect(await screen.findByText(repo1.nameWithOwner)).toBeInTheDocument())

        await user.click(screen.getByLabelText(`Select: ${repo2.nameWithOwner}`))

        await user.click(await screen.findByRole('button', {name: 'Apply'}))

        expect(screen.getByText('Repositories: 1 selected')).toBeInTheDocument()
      })
    })

    describe('canceling', () => {
      it('reverts back to previously selected', async () => {
        const queryFn = jest.fn().mockReturnValue([repo1, repo2])
        const {user} = renderComponent({initialSelected: [repo1], queryFn})

        await openPicker()
        await waitFor(async () => expect(await screen.findByText(repo1.nameWithOwner)).toBeInTheDocument())

        await user.click(screen.getByLabelText(`Select: ${repo2.nameWithOwner}`))

        await user.click(await screen.findByRole('button', {name: 'Cancel'}))

        expect(screen.getByText('Repositories: 1 selected')).toBeInTheDocument()
      })
    })
  })

  describe('ListButton', () => {
    it('has count of previously selected repos', async () => {
      const queryFn = jest.fn().mockReturnValue([repo1])
      renderComponent({initialSelected: [repo1], queryFn})

      await waitFor(async () => expect(await screen.findByText('Repositories: 1 selected')).toBeInTheDocument())
    })
  })

  describe('ListDialog', () => {
    describe('removing one', () => {
      it('removes it from the selected list and updates ListButton', async () => {
        const queryFn = jest.fn().mockReturnValue([])
        const {user} = renderComponent({initialSelected: [repo1, repo2], queryFn})

        await openList({count: 2})

        const trashCan = (await screen.findAllByLabelText('Remove from training set'))[0]
        await user.click(trashCan!)

        expect(screen.queryByText(repo1.name)).not.toBeInTheDocument()

        const closeIcon = await screen.findByLabelText('Close')
        await user.click(closeIcon)

        await waitFor(async () => expect(await screen.findByText('Repositories: 1 selected')).toBeInTheDocument())
      })
    })

    describe('removing the last one', () => {
      it('closes automatically, hides ListButton, and sets to All repositories', async () => {
        const queryFn = jest.fn().mockReturnValue([])
        const {user} = renderComponent({initialSelected: [repo1], queryFn})

        await openList({count: 1})

        const trashCan = await screen.findByLabelText('Remove from training set')
        await user.click(trashCan)

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
        await waitFor(() => expect(screen.queryByText('Repositories: 1 selected')).not.toBeInTheDocument())
        expect(await screen.findByRole('button', {name: 'All repositories'})).toBeInTheDocument()
      })
    })
  })
})
