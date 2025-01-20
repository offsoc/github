import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {CreateIssueDialogHeader} from '../dialog/CreateIssueDialogHeader'
import {LABELS} from '../constants/labels'
import {IssueCreateContextProvider} from '../contexts/IssueCreateContext'
import {getSafeConfig} from '../utils/option-config'
import {BUTTON_LABELS} from '../constants/buttons'
import {DisplayMode} from '../utils/display-mode'
import {buildMockRepository, buildMockTemplate, type MockRepository} from './helpers'
import {IssueCreationKind} from '../utils/model'

const defaultTemplate = buildMockTemplate({name: 'MockTemplate', fileName: 'MockTemplate.md'})

const defaultRepo: MockRepository = buildMockRepository({
  owner: 'orgA',
  name: 'repoA',
  viewerCanWrite: true,
})

function TestComponent({
  bypassTemplateSelection = false,
  showFullScreenButton = true,
  template,
  optionConfig,
}: {
  bypassTemplateSelection?: boolean
  showFullScreenButton?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template?: any
  optionConfig?: Partial<ReturnType<typeof getSafeConfig>>
}) {
  const config = {
    ...getSafeConfig({
      showFullScreenButton,
      defaultDisplayMode: bypassTemplateSelection ? DisplayMode.IssueCreation : DisplayMode.TemplatePicker,
    }),
    ...(optionConfig ?? {}),
  }

  return (
    <IssueCreateContextProvider
      optionConfig={config}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      preselectedData={{repository: defaultRepo as any, template}}
    >
      <CreateIssueDialogHeader
        dialogLabelId={'dialogLabelId'}
        dialogDescriptionId={'dialogDescriptionId'}
        onClose={noop}
        navigate={() => {}}
      />
    </IssueCreateContextProvider>
  )
}

describe('CreateIssueDialogHeader', () => {
  test('renders the correct header title for template pane', () => {
    render(<TestComponent />)
    expect(screen.getByRole('heading', {name: LABELS.issueCreateDialogTitleTemplatePane})).toBeInTheDocument()
  })

  test('renders the correct header title for issue creation', () => {
    render(<TestComponent bypassTemplateSelection={true} template={defaultTemplate} />)
    expect(
      screen.getByRole('heading', {
        name: LABELS.issueCreateDialogTitleCreationPane(defaultRepo.nameWithOwner, defaultTemplate.name),
      }),
    ).toBeInTheDocument()
  })

  test('renders the correct header title for sub-issue creation', () => {
    render(
      <TestComponent
        bypassTemplateSelection={true}
        template={defaultTemplate}
        optionConfig={{
          issueCreateArguments: {
            parentIssue: {
              id: '123',
            },
          },
        }}
      />,
    )
    expect(
      screen.getByRole('heading', {
        name: LABELS.issueCreateDialogTitleCreationPane(defaultRepo.nameWithOwner, defaultTemplate.name, 'sub-issue'),
      }),
    ).toBeInTheDocument()
  })

  test('ignores the template title suffix on a undefined template', () => {
    render(<TestComponent bypassTemplateSelection={true} template={undefined} />)
    expect(
      screen.getByRole('heading', {
        name: LABELS.issueCreateDialogTitleCreationPane(defaultRepo.nameWithOwner, undefined),
      }),
    ).toBeInTheDocument()
  })

  test('ignores the template title suffix on a blank template', () => {
    render(
      <TestComponent
        bypassTemplateSelection={true}
        template={buildMockTemplate({kind: IssueCreationKind.BlankIssue})}
      />,
    )
    expect(
      screen.getByRole('heading', {
        name: LABELS.issueCreateDialogTitleCreationPane(defaultRepo.nameWithOwner, undefined),
      }),
    ).toBeInTheDocument()
  })

  test('shows by default the copy URL button for the template selection', () => {
    render(<TestComponent />)
    expect(screen.getByRole('button', {name: BUTTON_LABELS.copyUrl})).toBeInTheDocument()
  })

  test('by default does not show the fullscreen button on the template selection', () => {
    render(<TestComponent />)
    expect(screen.queryByRole('button', {name: BUTTON_LABELS.createFullscreen})).not.toBeInTheDocument()
  })

  test('when defaulting to the issue creation, shows the fullscreen button and not the copy URL button', () => {
    render(<TestComponent bypassTemplateSelection={true} />)
    expect(screen.queryByRole('button', {name: BUTTON_LABELS.copyUrl})).not.toBeInTheDocument()
    expect(screen.getByRole('button', {name: BUTTON_LABELS.createFullscreen})).toBeInTheDocument()
  })

  test('shows neither the copy URL button nor the fullscreen button when fullscreen button is disabled and on issue creation', () => {
    render(<TestComponent bypassTemplateSelection={true} showFullScreenButton={false} />)
    expect(screen.queryByRole('button', {name: BUTTON_LABELS.copyUrl})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: BUTTON_LABELS.createFullscreen})).not.toBeInTheDocument()
  })

  test('copy URL still shows even if fullscreen button is disabled and on template selection', () => {
    render(<TestComponent showFullScreenButton={false} />)
    expect(screen.getByRole('button', {name: BUTTON_LABELS.copyUrl})).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: BUTTON_LABELS.createFullscreen})).not.toBeInTheDocument()
  })
})
