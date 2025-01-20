import {Box, Heading, PageLayout, TabNav} from '@primer/react'
import {Link} from '@github-ui/react-core/link'
import {CreateBranchButton} from '@github-ui/create-branch-button'
import type {PropsWithChildren} from 'react'
import {useCreateBranchButtonOptions} from '../contexts/CreateBranchButtonOptionContext'
import type {BranchPageType} from '../types'
import {BRANCH_PAGES} from '../constants'
import SearchInput from './SearchInput'
import BranchPagination from './BranchPagination'
import useBranchTabPath from '../hooks/use-branch-tab-path'
import {useCurrentRepository} from '@github-ui/current-repository'

export default function Layout({
  selectedPage,
  children,
}: PropsWithChildren<{
  selectedPage: BranchPageType
}>) {
  const {currentUserCanPush} = useCurrentRepository()
  const getBranchTabPath = useBranchTabPath()
  const createButtonOptions = useCreateBranchButtonOptions()

  return (
    <PageLayout>
      <PageLayout.Header>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Heading as="h1" sx={{fontSize: 4, fontWeight: 'normal'}}>
            Branches
          </Heading>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            {currentUserCanPush && <CreateBranchButton {...createButtonOptions} liveReload />}
          </Box>
        </Box>
      </PageLayout.Header>

      <PageLayout.Content as="div">
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
          <TabNav>
            {BRANCH_PAGES.filter(({onlyShowForPushUsers}) => currentUserCanPush || !onlyShowForPushUsers).map(page => (
              <TabNav.Link
                key={page.type}
                as={Link}
                to={getBranchTabPath(page.type)}
                selected={page.type === selectedPage}
              >
                {page.title}
              </TabNav.Link>
            ))}
          </TabNav>

          <SearchInput selectedPage={selectedPage} />

          <div data-hpc>{children}</div>

          {selectedPage !== 'overview' ? <BranchPagination /> : null}
        </Box>
      </PageLayout.Content>
    </PageLayout>
  )
}
