import {render} from '@github-ui/react-core/test-utils'
import {isMacOS} from '@github-ui/get-os'

import {screen, act} from '@testing-library/react'
import type {OperationDescriptor} from 'relay-runtime'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import {RepositoryTemplates} from '../RepositoryAndTemplatePickerDialog'
import type {RelayMockEnvironment} from 'relay-test-utils/lib/RelayModernMockEnvironment'
import {IssueCreationKind} from '../utils/model'
import {LABELS} from '../constants/labels'
import {type MockRepository, buildMockRepository} from './helpers'
import {CreateIssueTestComponent, CreateIssueWithoutQueryRefTestComponent} from '../test-utils/CreateIssueTestComponent'
import {DisplayMode} from '../utils/display-mode'

jest.mock('@github-ui/get-os')
jest.setTimeout(40_000)

const repoWritable = buildMockRepository({owner: 'orgA', name: 'repoA', hasSecurityPolicy: true, viewerCanWrite: true})
const repoReadonly = buildMockRepository({
  owner: 'orgA',
  name: 'repoB',
  hasSecurityPolicy: false,
  viewerCanWrite: false,
  viewerCanType: false,
})

const repositories: MockRepository[] = [
  repoWritable,
  repoReadonly,
  buildMockRepository({owner: 'orgBB', name: 'repoC'}),
  buildMockRepository({
    owner: 'orgBB',
    name: 'repoD',
    noTemplates: true,
    viewerCanWrite: true,
    hasSecurityPolicy: false,
    noContactLinks: true,
  }),
  buildMockRepository({owner: 'orgC', name: 'repoE', hasIssuesEnabled: false}),
]

describe('tests the issue create dialog', () => {
  let environment: RelayMockEnvironment

  beforeEach(() => {
    environment = createMockEnvironment()

    setTopRepositoriesMock()
    setTemplatesMock(repositories)

    window.sessionStorage.clear()
  })

  function setTopRepositoriesMock() {
    environment.mock.queuePendingOperation(TopRepositories, {topRepositoriesFirst: 10, hasIssuesEnabled: true})

    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        RepositoryConnection() {
          return {
            edges: [{node: repositories[0]}, {node: repositories[1]}, {node: repositories[2]}, {node: repositories[3]}],
          }
        },
      })
    })
  }

  function setTemplatesMock(mockedRepos: MockRepository[], withIssueType: boolean = false) {
    for (const repository of mockedRepos) {
      const issueTemplates = repository.issueTemplates?.map(t => ({...t}))
      // If setting the issue type, mock the issue type on the first template
      // We can't do this on the mocked repository helper, because IssueTypePickerIssueType if a fragment
      if (issueTemplates?.[0] && withIssueType) {
        issueTemplates[0].type = {
          __typename: 'IssueType',
          id: '1',
          name: 'Bug',
          ' $fragmentSpreads': {
            IssueTypePickerIssueType: true,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }

      environment.mock.queuePendingOperation(RepositoryTemplates, {id: repository.id})
      environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
        return MockPayloadGenerator.generate(operation, {
          Query() {
            return {
              node: {
                ...repository,
                issueTemplates,
              },
            }
          },
        })
      })
    }
  }

  const defaultTemplateName = 'template name 1 - repoA'

  function getActionListRowForTemplate(templateName: string) {
    return screen.getByRole('link', {name: templateName})
  }

  function getFirstTemplate(repository: MockRepository) {
    return {
      name: repository.issueTemplates![0]!.title,
      kind: IssueCreationKind.IssueTemplate,
      data: repository.issueTemplates![0],
    }
  }

  test('renders issue create, no predefined repository, show template picker', async () => {
    render(<CreateIssueTestComponent environment={environment} />)

    // find the repository picker
    await screen.findByText('orgA/repoA')

    // find the first template
    await screen.findByText('about template 1', {exact: false})
    await screen.findByText('template name 1', {exact: false})

    // find the second template
    await screen.findByText('about template 2', {exact: false})
    await screen.findByText('template name 2', {exact: false})

    // The security policy is shown as it exists in this repo
    await screen.findByText(LABELS.securityPolicyName, {exact: false})
    await screen.findByText(LABELS.securityPolicyDescription, {exact: false})

    const templateLink = await screen.findByText(LABELS.editTemplates, {exact: false})
    expect(templateLink.getAttribute('href')).toBe('/template/tree/url')

    // The security href correct points the the supplied security URL
    const securityLink = getActionListRowForTemplate(LABELS.securityPolicyName)
    expect(securityLink.getAttribute('href')).toBe('/security/policy')

    const link = getActionListRowForTemplate('external link 1')
    expect(link.getAttribute('href')).toBe('https://github.com')
    const link2 = getActionListRowForTemplate('link name 2')
    expect(link2.getAttribute('href')).toBe('https://github.com/foo')
  })

  test('ensure security policy is not shown without a policy defined', async () => {
    render(<CreateIssueTestComponent environment={environment} />)

    const repoInput = await screen.findByText('orgA/repoA', {exact: false})
    act(() => {
      repoInput.click()
    })

    const nextRepo = await screen.findByText('orgA/repoB', {exact: false})
    act(() => {
      nextRepo.click()
    })

    await screen.findByText('template name 1 - repoB', {exact: false})

    // For repoB, there is no security policy, ensure it is not shown
    const securityPolicy = screen.queryByText(LABELS.securityPolicyName, {exact: false})
    expect(securityPolicy).toBe(null)

    // For repoB, they don't have push permissions so show 'view' text instead of edit.
    const templateLink = await screen.findByText(LABELS.viewTemplates, {exact: false})
    expect(templateLink.getAttribute('href')).toBe('/template/tree/url')
  })

  test('renders issue create, predefined repository, show template selector but not the repository selector', async () => {
    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repositories[0] as any}
        environment={environment}
        scopedRepository={repositories[0]}
      />,
    )

    // template showns
    await screen.findByText('template name 1', {exact: false})
    await screen.findByText('template name 2', {exact: false})

    // Repository header not shown
    const repositoryTitle = screen.queryByText('Repository', {exact: false})
    expect(repositoryTitle).toBe(null)
  })

  test('warning is shown for repository with issues disabled', async () => {
    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repositories[4] as any}
        environment={environment}
        scopedRepository={repositories[4]}
      />,
    )

    // Information about disabled issues is shown
    await expect(
      screen.findByText('Issues are disabled for the selected repository. Please select a different repository.', {
        exact: false,
      }),
    ).resolves.toBeInTheDocument()
  })

  test('warning is not shown for repository with issues enabled', async () => {
    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repositories[3] as any}
        environment={environment}
        scopedRepository={repositories[3]}
      />,
    )

    // Information about disabled issues is not shown
    expect(
      screen.queryByText('Issues are disabled for the selected repository. Please select a different repository.'),
    ).not.toBeInTheDocument()
  })

  test('renders issue create, predefined repository, show template selector and the repository selector', async () => {
    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repositories[0] as any}
        environment={environment}
      />,
    )

    // template showns
    await screen.findByText('template name 1', {exact: false})

    // Repository header also shown
    await expect(screen.findByText('Repository', {exact: false})).resolves.toBeInTheDocument()
  })

  test('renders issue create, predefined repository and template, prefill title and body', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const template = getFirstTemplate(repositories[0]!) as any

    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repositories[0] as any}
        selectedTemplate={template}
        environment={environment}
      />,
    )

    // title is set from template
    const titleInput = await screen.findByLabelText('Add a title')
    expect(titleInput).toHaveValue('template title 1')

    // body is set from template
    const bodyInput = await screen.findByLabelText('Markdown value')
    expect(bodyInput).toHaveValue('template body 1')
  })

  test('create issue using meta+enter on mac', async () => {
    const createIssue = jest.fn()

    const isMacOSMock = isMacOS as jest.Mock
    isMacOSMock.mockReturnValue(true)

    const {user} = render(<CreateIssueTestComponent environment={environment} onCreateSuccess={createIssue} />)

    // click on the blank issue template
    const template = getActionListRowForTemplate(LABELS.blankIssueName)
    act(() => {
      template.click()
    })

    // set a title
    const titleInput = await screen.findByLabelText('Add a title')
    await user.type(titleInput, 'test title')

    // set a body
    const bodyInput = await screen.findByLabelText('Markdown value')
    await user.type(bodyInput, 'test body')

    // focus non input element
    const addMoreCheckbox = screen.getByRole('checkbox')
    addMoreCheckbox.focus()

    // simulater Cmd+Enter
    await user.keyboard('{Meta>}[Enter]{/Meta}')

    expect(createIssue).toHaveBeenCalled()
  })

  test('submit button is inactive when a file is still being uploaded', async () => {
    const createIssue = jest.fn()

    const {user} = render(<CreateIssueTestComponent environment={environment} onCreateSuccess={createIssue} />)

    // click on the blank issue template
    const template = getActionListRowForTemplate(LABELS.blankIssueName)
    act(() => {
      template.click()
    })

    // set a body
    const bodyInput = await screen.findByLabelText('Markdown value')
    await user.type(bodyInput, '<!-- Uploading "image.png"... -->')

    const commitButton = screen.getByTestId('create-issue-button')
    expect(commitButton.getAttribute('data-inactive')).toBeTruthy()
  })

  test('create issue using ctrl+enter on non-mac', async () => {
    const createIssue = jest.fn()

    const isMacOSMock = isMacOS as jest.Mock
    isMacOSMock.mockReturnValue(false)

    const {user} = render(<CreateIssueTestComponent environment={environment} onCreateSuccess={createIssue} />)

    // click on the blank issue template
    const template = getActionListRowForTemplate(LABELS.blankIssueName)
    act(() => {
      template.click()
    })

    // set a title
    const titleInput = await screen.findByLabelText('Add a title')
    await user.type(titleInput, 'test title')

    // set a body
    const bodyInput = await screen.findByLabelText('Markdown value')
    await user.type(bodyInput, 'test body')

    // focus non input element
    const addMoreCheckbox = screen.getByRole('checkbox')
    addMoreCheckbox.focus()

    // simulate Control+Enter
    await user.keyboard('{Control>}[Enter]{/Control}')

    expect(createIssue).toHaveBeenCalled()
  })

  test('clicking on template picker renders issue create dialog', async () => {
    render(<CreateIssueTestComponent environment={environment} />)

    // click on the first template
    const template = getActionListRowForTemplate(defaultTemplateName)
    act(() => {
      template.click()
    })

    // issue create is shown
    await screen.findByLabelText('Add a title')

    // template picker is no longer shown
    const title2 = screen.queryByText('template name 2', {exact: false})
    expect(title2).toBe(null)
  })

  test('clicking on form goes into the form flow', async () => {
    render(<CreateIssueTestComponent environment={environment} />)

    // click on the first template
    const form = getActionListRowForTemplate('Form name 1')
    act(() => {
      form.click()
    })

    // issue create is shown
    await screen.findByLabelText('Add a title')

    // template picker is no longer shown
    const title2 = screen.queryByText('template title 1', {exact: false})
    expect(title2).toBe(null)
  })

  test('focuses template picker button if it is the first input', async () => {
    const firstRepository = buildMockRepository({owner: 'orgA', name: 'repoA'})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const template = getFirstTemplate(firstRepository) as any

    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={firstRepository as any}
        defaultDisplayMode={DisplayMode.IssueCreation}
        environment={environment}
        selectedTemplate={template}
      />,
    )

    // find the first input
    const focusedInput = await screen.findByRole('button', {name: /template title/i})
    expect(focusedInput).toHaveFocus()
  })

  test('repository without any templates doesnt show the template edit button', async () => {
    environment = createMockEnvironment()
    setTopRepositoriesMock()
    const emptyRepository = repositories[3]!
    setTemplatesMock([emptyRepository])

    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={emptyRepository as any}
        environment={environment}
      />,
    )

    const blankTemplate = getActionListRowForTemplate(LABELS.blankIssueName)
    expect(blankTemplate).toBeInTheDocument()
    const firstTemplateMissing = screen.queryByText(defaultTemplateName, {exact: false})
    expect(firstTemplateMissing).toBe(null)

    let templateButton = screen.queryByText(LABELS.viewTemplates, {exact: false})
    expect(templateButton).toBe(null)

    templateButton = screen.queryByText(LABELS.editTemplates, {exact: false})
    expect(templateButton).toBe(null)
  })

  test('repository where user doesnt have write access show readonly metadata pickers', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const template = getFirstTemplate(repoReadonly) as any
    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repoReadonly as any}
        environment={environment}
        selectedTemplate={template}
      />,
    )

    // title is set
    const titleInput = await screen.findByLabelText('Add a title')
    expect(titleInput).toHaveValue('template title 1')

    // body is set
    const bodyInput = await screen.findByLabelText('Markdown value')
    expect(bodyInput).toHaveValue('template body 1')

    // metadata pickers are not shown as button
    const assigneePicker = screen.queryByRole('button', {name: 'Edit Assignees'})
    expect(assigneePicker).not.toBeInTheDocument()

    const labelPicker = screen.queryByRole('button', {name: 'Edit Labels'})
    expect(labelPicker).not.toBeInTheDocument()

    const projectPicker = screen.queryByRole('button', {name: 'Edit Projects'})
    expect(projectPicker).not.toBeInTheDocument()

    const milestonePicker = screen.queryByRole('button', {name: 'Edit Milestone'})
    expect(milestonePicker).not.toBeInTheDocument()
  })

  test('repository where user have write access show editable metadata pickers', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const template = getFirstTemplate(repoWritable) as any
    render(
      <CreateIssueTestComponent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repoWritable as any}
        environment={environment}
        selectedTemplate={template}
      />,
    )

    // title is set
    const titleInput = await screen.findByLabelText('Add a title')
    expect(titleInput).toHaveValue('template title 1')

    // body is set
    const bodyInput = await screen.findByLabelText('Markdown value')
    expect(bodyInput).toHaveValue('template body 1')

    // metadata pickers are shown as button
    const assigneePicker = await screen.findByRole('button', {name: 'Edit Assignees'})
    expect(assigneePicker).toBeInTheDocument()

    const labelPicker = await screen.findByRole('button', {name: 'Edit Labels'})
    expect(labelPicker).toBeInTheDocument()

    const projectPicker = await screen.findByRole('button', {name: 'Edit Projects'})
    expect(projectPicker).toBeInTheDocument()

    const milestonePicker = await screen.findByRole('button', {name: 'Edit Milestone'})
    expect(milestonePicker).toBeInTheDocument()
  })

  test('focuses title input if it is the first input', async () => {
    const firstRepository = buildMockRepository({owner: 'orgA', name: 'repoA'})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const template = getFirstTemplate(firstRepository) as any

    render(
      <CreateIssueWithoutQueryRefTestComponent
        environment={environment}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={firstRepository as any}
        selectedTemplate={template}
      />,
    )

    const focusedInput = screen.queryByLabelText('Add a title')
    expect(focusedInput).toHaveFocus()
  })

  test('clicking on an issue template sets title and body within the modal', async () => {
    render(<CreateIssueTestComponent environment={environment} />)

    // click on the first template
    const template = getActionListRowForTemplate(defaultTemplateName)
    act(() => {
      template.click()
    })

    // title is set
    const titleInput = await screen.findByLabelText('Add a title')
    expect(titleInput).toHaveValue('template title 1')

    // body is set
    const bodyInput = await screen.findByLabelText('Markdown value')
    expect(bodyInput).toHaveValue('template body 1')
  })

  test('Shows the type in write mode for a triage or higher user when provided by a template', async () => {
    environment = createMockEnvironment()
    setTopRepositoriesMock()

    setTemplatesMock(repositories, true)

    const {user} = render(<CreateIssueTestComponent environment={environment} />)

    // click on the first template
    const template = getActionListRowForTemplate(defaultTemplateName)

    await user.click(template)

    // title is set
    const titleInput = screen.getByLabelText('Add a title')
    expect(titleInput).toHaveValue('template title 1')

    // body is set
    const bodyInput = screen.getByLabelText('Markdown value')
    expect(bodyInput).toHaveValue('template body 1')

    // type button exists
    const typeButton = screen.getByRole('button', {name: 'Bug'})
    expect(typeButton).toBeInTheDocument()

    await user.click(typeButton)

    expect(screen.queryByTestId('issue-types-permission-dialog')).not.toBeInTheDocument()
  })

  test('Shows the type in read only mode for a read only user when provided by a template', async () => {
    environment = createMockEnvironment()
    setTopRepositoriesMock()

    setTemplatesMock(repositories, true)

    const {user} = render(<CreateIssueTestComponent environment={environment} />)

    const repoInput = screen.getByText('orgA/repoA', {exact: false})

    await user.click(repoInput)

    // Click on the read only repo
    const nextRepo = screen.getByText('orgA/repoB', {exact: false})

    await user.click(nextRepo)

    // click on the first template
    const template = getActionListRowForTemplate('template name 1 - repoB')

    await user.click(template)

    // title is set
    const titleInput = screen.getByLabelText('Add a title')
    expect(titleInput).toHaveValue('template title 1')

    // body is set
    const bodyInput = screen.getByLabelText('Markdown value')
    expect(bodyInput).toHaveValue('template body 1')

    // type button exists
    const typeButton = screen.getByRole('button', {name: 'Bug'})
    expect(typeButton).toBeInTheDocument()

    await user.click(typeButton)

    expect(screen.getByTestId('issue-types-permission-dialog')).toBeInTheDocument()
  })

  test('clicking on an issue template doesnt show the back button by default', async () => {
    render(<CreateIssueTestComponent environment={environment} />)

    // click on the first template
    const template = getActionListRowForTemplate(defaultTemplateName)
    act(() => {
      template.click()
    })

    // The back button is not shown
    expect(screen.queryByText('template name 1', {exact: false})).not.toBeInTheDocument()
    expect(screen.queryByText('in', {exact: true})).not.toBeInTheDocument()
    expect(screen.queryByText('orgA/repoA', {exact: false})).not.toBeInTheDocument()

    // title is shown, indicating we are in the issue create flow
    const titleInput = await screen.findByLabelText('Add a title')
    expect(titleInput).toHaveValue('template title 1')
  })

  test('Shows back button when the default display mode bypasses template selection', async () => {
    render(
      <CreateIssueTestComponent
        environment={environment}
        defaultDisplayMode={DisplayMode.IssueCreation}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repositories[0] as any}
      />,
    )

    // The back button is shown
    await screen.findByText('Blank issue', {exact: false})
    await screen.findByText('in', {exact: true})
    await screen.findByText('orgA/repoA', {exact: false})

    // title is shown, indicating we are in the issue create flow
    const titleInput = await screen.findByLabelText('Add a title')
    expect(titleInput).toHaveValue('')
  })

  test('Shows back button when the default display mode bypasses template selection via overriding the default display mode', async () => {
    render(
      <CreateIssueTestComponent
        environment={environment}
        overrideFallbackDisplaymode={DisplayMode.IssueCreation}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preselectedRepository={repositories[0] as any}
      />,
    )

    // The back button is shown
    await screen.findByText('Blank issue', {exact: false})
    await screen.findByText('in', {exact: true})
    await screen.findByText('orgA/repoA', {exact: false})

    // title is shown, indicating we are in the issue create flow
    const titleInput = await screen.findByLabelText('Add a title')
    expect(titleInput).toHaveValue('')
  })

  test('clicking on an issue template stays within the modal if `navigateToFullScreenOnTemplateChoice` is false', async () => {
    const navigateFn = jest.fn()
    render(
      <CreateIssueTestComponent
        environment={environment}
        navigate={navigateFn}
        navigateToFullScreenOnTemplateChoice={false}
      />,
    )

    // click on the first template
    const template = getActionListRowForTemplate(defaultTemplateName)
    act(() => {
      template.click()
    })

    // title is set
    const titleInput = await screen.findByLabelText('Add a title')
    expect(titleInput).toHaveValue('template title 1')

    expect(navigateFn).not.toHaveBeenCalled()
  })

  test('clicking on an issue template stays navigates to fullscreen if `navigateToFullScreenOnTemplateChoice` is true', async () => {
    const navigateFn = jest.fn()

    render(
      <CreateIssueTestComponent
        environment={environment}
        navigate={navigateFn}
        navigateToFullScreenOnTemplateChoice={true}
      />,
    )

    // click on the first template
    const template = getActionListRowForTemplate(defaultTemplateName)
    act(() => {
      template.click()
    })

    expect(navigateFn).toHaveBeenCalledWith('/issues/new?org=orgA&repo=repoA&template=template1.yml')
  })
})
