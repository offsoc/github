import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'
import {type ComponentProps, useState} from 'react'

import {CurrentOrgRepoProvider} from '../contexts/CurrentOrgRepoContext'
import {sampleRepos} from '../test-utils/mock-data'
import {ReposPropertiesList} from './ReposPropertiesList'

const meta: Meta = {
  title: 'Apps/Custom Properties/Components/ReposPropertiesList',
  decorators: [
    Story => (
      <Wrapper>
        <CurrentOrgRepoProvider>
          <Story />
        </CurrentOrgRepoProvider>
      </Wrapper>
    ),
  ],
}

export default meta

const sampleProps: ComponentProps<typeof ReposPropertiesList> = {
  orgName: 'github',
  repos: sampleRepos,
  repositoryCount: sampleRepos.length,
  pageCount: 4,
  selectedRepoIds: new Set(),
  page: 1,
  showSpinner: false,
  onSelectionChange: () => undefined,
  onPageChange: () => undefined,
  onEditRepoPropertiesClick: () => undefined,
}

export const DefaultList = () => {
  const [selection, setSelection] = useState<Set<number>>(new Set())
  return <ReposPropertiesList {...sampleProps} selectedRepoIds={selection} onSelectionChange={setSelection} />
}
