import {render, screen} from '@testing-library/react'
import {TemplateListPaneFooter} from '../TemplateListPaneFooter'
import {buildMockRepository} from './helpers'
import {getDefaultConfig} from '../utils/option-config'
import {IssueCreateContextProvider} from '../contexts/IssueCreateContext'

const mockTemplate = {
  isBlankIssuesEnabled: true,
  isSecurityPolicyEnabled: true,
  issueForms: [
    {
      description: 'File a bug report',
      name: 'Bug report',
      title: '[Bug]: ',
      filename: 'bugs.yml',
    },
  ],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WrappedFooter = ({repository, templates}: {repository: any; templates: any}) => {
  return (
    <IssueCreateContextProvider optionConfig={getDefaultConfig()} preselectedData={undefined}>
      <TemplateListPaneFooter repository={repository} templates={templates} />
    </IssueCreateContextProvider>
  )
}

test('renders the issue types copy when the viewer can access types', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repo = buildMockRepository({owner: 'orgA', name: 'repoA', viewerCanType: true}) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render(<WrappedFooter repository={repo} templates={mockTemplate as any} />)

  expect(screen.getByText('You can now add issue types to your forms and templates!')).toBeInTheDocument()
})

test('does not render the issue types copy when the viewer cannot access types', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repo = buildMockRepository({owner: 'orgA', name: 'repoA', viewerCanType: false}) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render(<WrappedFooter repository={repo} templates={mockTemplate as any} />)

  expect(screen.queryByText('You can now add issue types to your forms and templates!')).not.toBeInTheDocument()
})
