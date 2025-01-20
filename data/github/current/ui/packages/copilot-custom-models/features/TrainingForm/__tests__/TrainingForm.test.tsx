import {screen, waitFor} from '@testing-library/react'
import {render, type User} from '@github-ui/react-core/test-utils'
import type {ComponentProps} from 'react'
import {TrainingForm} from '../TrainingForm'
import type {FormValues} from '../types'
import type {Language} from '../../../types'
import {clickMenuItem, clickPickerButton, openList, openPicker} from '../../RepoPicker/__tests__/test-utils'
import type {BaseRepo} from '../../RepoPicker/types'

type Props = ComponentProps<typeof TrainingForm>

const defaultValues: FormValues = {
  languages: [],
  repository_nwos: null,
}

const availableLanguages: Language[] = [
  {name: 'JavaScript', color: '#f1e05a', id: 183},
  {name: 'Ruby', color: '#701516', id: 326},
  {name: 'Python', color: '#00cc00', id: 213},
]

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

const defaultProps: Props = {
  availableLanguages,
  isSubmitting: false,
  onSubmit: jest.fn(),
  repoPickerQueryFn: jest.fn().mockReturnValue([]),
}

function renderComponent(props: Partial<Props>) {
  const combinedProps = {...defaultProps, ...props}
  return render(<TrainingForm {...combinedProps} />)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('<TrainingForm />', () => {
  describe('form errors', () => {
    it('displays all provided', () => {
      const formErrors: Required<Props['formErrors']> = {
        general_errors: [{heading: 'error heading', message: 'error message'}] as const,
        languages: ['languages error'] as const,
        repository_nwos: ['repository_nwos error'] as const,
      }

      renderComponent({formErrors})

      expect(screen.getByText(formErrors.general_errors[0]!.heading)).toBeInTheDocument()
      expect(screen.getByText(formErrors.general_errors[0]!.message)).toBeInTheDocument()
      expect(screen.getByText(formErrors.languages[0]!)).toBeInTheDocument()
      expect(screen.getByText(formErrors.repository_nwos[0]!)).toBeInTheDocument()
    })
  })

  describe('repo picker field', () => {
    describe('when creating', () => {
      it('does not initially show selected repos button', () => {
        renderComponent({})

        expect(screen.getByRole('button', {name: 'All repositories'})).toBeInTheDocument()
      })

      it('submits as null, does not call fetchSelected when picker unopened', async () => {
        const fetchSelected = jest.fn()
        const onSubmit = jest.fn()

        const {user} = renderComponent({fetchSelected, onSubmit})

        await submitForm(user)

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, repository_nwos: null})
        expect(fetchSelected).not.toHaveBeenCalled()
      })

      it('submits as empty array when set to All Repositories', async () => {
        const onSubmit = jest.fn()

        const {user} = renderComponent({onSubmit})

        await clickPickerButton()
        await clickMenuItem('selected')
        await clickPickerButton()
        await clickMenuItem('all')

        const submitBtn = screen.getByRole('button', {name: /Create new custom model/})
        await user.click(submitBtn)

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, repository_nwos: []})
      })

      it('submits the repo nwos when 1+ repositories selected', async () => {
        const onSubmit = jest.fn()
        const repoPickerQueryFn = jest.fn().mockReturnValue([repo1, repo2])

        const {user} = renderComponent({onSubmit, repoPickerQueryFn})

        await openPicker()
        await waitFor(async () => expect(await screen.findByText(repo1.nameWithOwner)).toBeInTheDocument())

        await user.click(screen.getByLabelText(`Select: ${repo1.nameWithOwner}`))

        await user.click(await screen.findByRole('button', {name: 'Apply'}))

        const submitBtn = screen.getByRole('button', {name: /Create new custom model/})
        await user.click(submitBtn)

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, repository_nwos: [repo1.nameWithOwner]})
      })
    })

    describe('when editing', () => {
      const isEditing = true

      it('initially renders Selected Repositories button and correct number of repos selected', () => {
        renderComponent({initialRepoCount: 1, isEditing})

        expect(screen.getByRole('button', {name: 'Select repositories'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Repositories: 1 selected'})).toBeInTheDocument()
        expect(screen.queryByRole('button', {name: 'All repositories'})).not.toBeInTheDocument()
      })

      it('calls fetchSelected when list dialog opened', async () => {
        const fetchSelected = jest.fn().mockReturnValue([repo1])

        renderComponent({fetchSelected, initialRepoCount: 1, isEditing})

        await openList({count: 1})

        expect(fetchSelected).toHaveBeenCalled()
      })

      it('submits as null, does not call fetchSelected when picker unopened', async () => {
        const fetchSelected = jest.fn()
        const onSubmit = jest.fn()

        const {user} = renderComponent({fetchSelected, isEditing, onSubmit})

        await submitForm(user, {isEditing})

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, repository_nwos: null})
        expect(fetchSelected).not.toHaveBeenCalled()
      })

      it('submits the initial repo nwos when picker opened and not modified', async () => {
        const fetchSelected = jest.fn()
        const initialSelectedRepos = [repo1]
        const onSubmit = jest.fn()

        const {user} = renderComponent({fetchSelected, initialSelectedRepos, isEditing, onSubmit})

        await openPicker()

        await submitForm(user, {isEditing})

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, repository_nwos: [repo1.nameWithOwner]})
        expect(fetchSelected).toHaveBeenCalled()
      })

      it('submits the initial repo nwos when list opened and not modified', async () => {
        const fetchSelected = jest.fn()
        const initialSelectedRepos = [repo1]
        const onSubmit = jest.fn()

        const {user} = renderComponent({fetchSelected, initialSelectedRepos, isEditing, onSubmit})

        await openList({count: 1})

        await submitForm(user, {isEditing})

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, repository_nwos: [repo1.nameWithOwner]})
        expect(fetchSelected).toHaveBeenCalled()
      })

      it('submits as empty array, does not call fetchSelected when set to All Repositories', async () => {
        const fetchSelected = jest.fn()
        const onSubmit = jest.fn()

        const {user} = renderComponent({fetchSelected, isEditing, onSubmit})

        await clickPickerButton()
        await clickMenuItem('all')

        await submitForm(user, {isEditing})

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, repository_nwos: []})
        expect(fetchSelected).not.toHaveBeenCalled()
      })

      it('submits the repo nwos when 1+ repositories selected', async () => {
        const initialSelectedRepos = [repo1]
        const onSubmit = jest.fn()
        const repoPickerQueryFn = jest.fn().mockReturnValue([repo1, repo2])

        const {user} = renderComponent({initialSelectedRepos, isEditing, onSubmit, repoPickerQueryFn})

        await openPicker()
        await waitFor(async () => expect(await screen.findByText(repo1.nameWithOwner)).toBeInTheDocument())

        await user.click(screen.getByLabelText(`Select: ${repo2.nameWithOwner}`))

        await user.click(await screen.findByRole('button', {name: 'Apply'}))

        await submitForm(user, {isEditing})

        expect(onSubmit).toHaveBeenCalledWith({
          ...defaultValues,
          repository_nwos: [repo1.nameWithOwner, repo2.nameWithOwner],
        })
      })
    })
  })

  describe('languages field', () => {
    describe('when creating', () => {
      it('is initially empty', async () => {
        const onSubmit = jest.fn()

        const {user} = renderComponent({onSubmit})

        for (const language of availableLanguages) {
          expect(screen.queryByText(language.name)).not.toBeInTheDocument()
        }

        await submitForm(user)

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, languages: []})
      })

      it('allows for languages to be added and submits languages as array of strings', async () => {
        const onSubmit = jest.fn()

        const {user} = renderComponent({onSubmit})

        const input = screen.getByLabelText('Language input')
        await user.type(input, 'JavaScr')
        const option = screen.getByText('JavaScript')
        await user.click(option)

        await submitForm(user)

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, languages: ['JavaScript']})
      })
    })

    describe('when editing', () => {
      const initialLanguages = ['JavaScript']

      it('is initially populated, assuming 1+ provided', async () => {
        const onSubmit = jest.fn()

        const {user} = renderComponent({initialLanguages, onSubmit})

        expect(screen.getByText('JavaScript')).toBeInTheDocument()
        expect(screen.queryByText('Ruby')).not.toBeInTheDocument()
        expect(screen.queryByText('Python')).not.toBeInTheDocument()

        await submitForm(user)

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, languages: initialLanguages})
      })

      it('allows for languages to be added and removed and submits languages as array of strings', async () => {
        const onSubmit = jest.fn()

        const {user} = renderComponent({initialLanguages, onSubmit})

        const input = screen.getByLabelText('Language input')
        await user.type(input, 'Rub')
        const option = screen.getByText('Ruby')
        await user.click(option)

        const previousOption = screen.getByText('JavaScript')
        await user.click(previousOption)
        await user.keyboard('{delete}')

        await submitForm(user)

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, languages: ['Ruby']})
      })
    })
  })

  describe('private telemetry checkbox', () => {
    describe('when showPrivateTelemetryToggle true and canCollectPrivateTelemetry true', () => {
      const canCollectPrivateTelemetry = true
      const showPrivateTelemetryToggle = true

      it('defaults to checked, and submits the correct value', async () => {
        const onSubmit = jest.fn()

        const {user} = renderComponent({canCollectPrivateTelemetry, onSubmit, showPrivateTelemetryToggle})

        const checkbox = screen.getByLabelText('Include data from prompts and suggestions')
        await user.click(checkbox)

        await submitForm(user)

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, private_telemetry: false})
      })

      it('defaults to unchecked when isEditing true, wasPrivateTelemetryCollected false', async () => {
        const isEditing = true
        const onSubmit = jest.fn()
        const wasPrivateTelemetryCollected = false

        const {user} = renderComponent({
          canCollectPrivateTelemetry,
          isEditing,
          onSubmit,
          showPrivateTelemetryToggle,
          wasPrivateTelemetryCollected,
        })

        const checkbox = screen.getByLabelText('Include data from prompts and suggestions')
        await user.click(checkbox)

        await submitForm(user, {isEditing})

        expect(onSubmit).toHaveBeenCalledWith({...defaultValues, private_telemetry: true})
      })
    })

    it('is not changeable and always false when canCollectPrivateTelemetry false', async () => {
      const canCollectPrivateTelemetry = false
      const onSubmit = jest.fn()
      const showPrivateTelemetryToggle = true
      const wasPrivateTelemetryCollected = true

      const {user} = renderComponent({
        canCollectPrivateTelemetry,
        onSubmit,
        showPrivateTelemetryToggle,
        wasPrivateTelemetryCollected,
      })

      // Clicking it would normally change `private_telemetry` to be `false`
      const checkbox = screen.getByLabelText('Include data from prompts and suggestions')
      await user.click(checkbox)

      // Not clicking it should theoretically keep `private_telemetry: true`, but
      // we check below that it submits as false.
      await submitForm(user)

      expect(onSubmit).toHaveBeenCalledWith({...defaultValues, private_telemetry: false})
    })

    it('is hidden and does not submit value when showPrivateTelemetryToggle false', async () => {
      const onSubmit = jest.fn()
      const showPrivateTelemetryToggle = false

      const {user} = renderComponent({onSubmit, showPrivateTelemetryToggle})

      expect(screen.queryByLabelText('Include data from prompts and suggestions')).not.toBeInTheDocument()

      await submitForm(user)

      expect(onSubmit).toHaveBeenCalledWith(defaultValues)
    })
  })

  describe('training time info', () => {
    const baseMsg = 'Training time is based on'
    const emailMsg = "We'll notify you at"

    it('includes the part about notifying when admin email provided', () => {
      const adminEmail = 'a@a.co'

      renderComponent({adminEmail})

      expect(screen.getByText(emailMsg, {exact: false})).toBeInTheDocument()
      expect(screen.getByText(baseMsg, {exact: false})).toBeInTheDocument()
    })

    it('does not include the part about notifying when admin email not provided', () => {
      const adminEmail = undefined

      renderComponent({adminEmail})

      expect(screen.getByText(baseMsg, {exact: false})).toBeInTheDocument()
      expect(screen.queryByText(emailMsg, {exact: false})).not.toBeInTheDocument()
    })
  })

  describe('submit button', () => {
    it('shows correct text when creating', async () => {
      const isEditing = false
      const onSubmit = jest.fn()

      const {user} = renderComponent({isEditing, onSubmit})

      await submitForm(user)

      expect(onSubmit).toHaveBeenCalledWith(defaultValues)
    })

    it('shows correct text when editing', async () => {
      const isEditing = true
      const onSubmit = jest.fn()

      const {user} = renderComponent({isEditing, onSubmit})

      await submitForm(user, {isEditing})

      expect(onSubmit).toHaveBeenCalledWith(defaultValues)
    })
  })

  describe('cancel button', () => {
    it('shows when onCancel provided', async () => {
      const onCancel = jest.fn()

      const {user} = renderComponent({onCancel})

      const btn = screen.getByRole('button', {name: /Cancel/})

      await user.click(btn)

      expect(onCancel).toHaveBeenCalled()
    })

    it('does not show when onCancel not provided', () => {
      renderComponent({})

      expect(screen.queryByRole('button', {name: /Cancel/})).not.toBeInTheDocument()
    })
  })
})

async function submitForm(user: User, {isEditing = false}: {isEditing?: boolean} = {}) {
  const name = isEditing ? 'Retrain model' : 'Create new custom model'
  const btn = screen.getByRole('button', {name})
  await user.click(btn)
}
