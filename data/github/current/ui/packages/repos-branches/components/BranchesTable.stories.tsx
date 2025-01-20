import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {ScreenSizeProvider} from '@github-ui/screen-size'
import {getBranches, getDeferredMetadata, getRepository} from '../test-utils/mock-data'
import BranchesTable from './BranchesTable'

const meta = {
  title: 'Repo Branches/Components/BranchesTable',
  component: BranchesTable,
}

export const Default = () => {
  const repo = getRepository()
  return (
    <Wrapper>
      <CurrentRepositoryProvider repository={repo}>
        <ScreenSizeProvider>
          <BranchesTable branches={getBranches()} />
        </ScreenSizeProvider>
      </CurrentRepositoryProvider>
    </Wrapper>
  )
}

export const WithMetadata = () => {
  const repo = getRepository()
  const deferredMetadata = getDeferredMetadata()
  return (
    <Wrapper>
      <CurrentRepositoryProvider repository={repo}>
        <ScreenSizeProvider>
          <BranchesTable branches={getBranches()} deferredMetadata={deferredMetadata} />
        </ScreenSizeProvider>
      </CurrentRepositoryProvider>
    </Wrapper>
  )
}

export default meta
