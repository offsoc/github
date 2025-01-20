import {Box, Octicon} from '@primer/react'
import {ChevronRightIcon} from '@primer/octicons-react'
import {Link} from '@github-ui/react-core/link'
import {Table} from '@primer/react/drafts'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useMemo, useState} from 'react'
import type {ReactNode} from 'react'
import Layout from '../components/Layout'
import BranchesTable from '../components/BranchesTable'
import {ProtectThisBranchBanner} from '../components/ProtectThisBranchBanner'
import useBranchTabPath from '../hooks/use-branch-tab-path'
import useDeferredMetadata from '../hooks/use-deferred-metadata'
import type {Branch, BranchMetadata} from '../types'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'

export interface OverviewPayload {
  branches: {
    default?: Branch
    yours: Branch[]
    active: Branch[]
  }
  hasMore: {
    yours: boolean
    active: boolean
  }
  protectThisBranchBanner: {
    dismissed: boolean
    isSecurityAdvisory: boolean
  }
}

function BranchSection({
  id,
  title,
  viewMorePath,
  branches,
  deferredMetadata,
  showMergeQueueHeader,
  showFooter,
  isSecurityAdvisory,
  onDismissBanner = () => null,
}: {
  id: string
  title: string
  viewMorePath?: string
  branches: Branch[]
  deferredMetadata?: Map<string, BranchMetadata>
  showMergeQueueHeader?: boolean
  showFooter?: boolean
  isSecurityAdvisory?: boolean
  onDismissBanner?: () => void
}) {
  const {screenSize} = useScreenSize()
  const isLarge = screenSize >= ScreenSize.xxxlarge
  const isDefault = id === 'default'

  if (!branches.length) {
    return null
  }

  return (
    <Box sx={{mb: 3}}>
      <Table.Container
        sx={
          showFooter
            ? {
                '& .TableOverflowWrapper:last-child .Table .TableBody .TableRow:last-of-type .TableCell': {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }
            : null
        }
      >
        <Table.Title as="h2" id={id}>
          {title}
        </Table.Title>

        <BranchesTable
          labelId={id}
          branches={branches}
          deferredMetadata={deferredMetadata}
          showMergeQueueHeader={showMergeQueueHeader}
          isLarge={isLarge}
        />
      </Table.Container>
      {isDefault && showFooter && !isSecurityAdvisory ? (
        <FooterRow>
          <ProtectThisBranchBanner onDismiss={onDismissBanner} />
        </FooterRow>
      ) : null}
      {viewMorePath && showFooter ? (
        <FooterRow>
          <span>
            <Link to={viewMorePath}>
              View more branches <Octicon icon={ChevronRightIcon} />
            </Link>
          </span>
        </FooterRow>
      ) : null}
    </Box>
  )
}

export function Overview() {
  const payload = useRoutePayload<OverviewPayload>()
  const getViewMorePath = useBranchTabPath()
  const repo = useCurrentRepository()
  const isSecurityAdvisory = payload.protectThisBranchBanner.isSecurityAdvisory
  const [isBannerDismissed, setIsBannerDismissed] = useState(payload.protectThisBranchBanner.dismissed)

  const branches = useMemo(() => {
    const allBranches = payload.branches.default ? [payload.branches.default] : []

    return allBranches
      .concat(payload.branches.yours)
      .concat(payload.branches.active)
      .map(branch => branch.name)
  }, [payload.branches.active, payload.branches.default, payload.branches.yours])

  const deferredMetadata = useDeferredMetadata(repo, branches)

  return (
    <Layout selectedPage="overview">
      {payload.branches.default && (
        <BranchSection
          id="default"
          title="Default"
          branches={[payload.branches.default]}
          deferredMetadata={deferredMetadata}
          showMergeQueueHeader={payload.branches.default.mergeQueueEnabled}
          onDismissBanner={() => {
            setIsBannerDismissed(true)
          }}
          showFooter={!isBannerDismissed}
          isSecurityAdvisory={isSecurityAdvisory}
        />
      )}
      <BranchSection
        id="yours"
        title="Your branches"
        branches={payload.branches.yours}
        deferredMetadata={deferredMetadata}
        viewMorePath={getViewMorePath('yours')}
        showFooter={payload.hasMore.yours}
      />
      <BranchSection
        id="Active"
        title="Active branches"
        branches={payload.branches.active}
        deferredMetadata={deferredMetadata}
        viewMorePath={getViewMorePath('active')}
        showFooter={payload.hasMore.active}
      />
    </Layout>
  )
}

function FooterRow({children}: {children: ReactNode}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'space-between',
        padding: 2,
        border: '1px solid',
        borderTop: 0,
        borderColor: 'border.default',
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
      }}
    >
      {children}
    </Box>
  )
}
