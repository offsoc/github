import {IssueTimelineLoading} from './IssueTimelineLoading'
import {IssueBodyLoading} from '@github-ui/issue-body/IssueBodyLoading'
import {HeaderLoading} from './header/HeaderLoading'
import {Box} from '@primer/react'
import {SidebarSectionsLoading} from './sections/SidebarSectionsLoading'
import {useRef, type FC} from 'react'
import {useContainerBreakpoint} from '@github-ui/use-container-breakpoint'
import {ContentWrapper} from './ContentWrapper'
import type {OptionConfig} from './OptionConfig'

type IssueViewerLoadingProps = {
  optionConfig: OptionConfig
}

export const IssueViewerLoading: FC<IssueViewerLoadingProps> = ({optionConfig}) => {
  const issueViewerContainerRef = useRef<HTMLDivElement>(null)

  const breakpoint = useContainerBreakpoint(issueViewerContainerRef.current)
  return (
    <ContentWrapper>
      <Box
        ref={issueViewerContainerRef}
        sx={{
          display: 'flex',
          flex: 'auto',
          flexDirection: 'column',
          justifyContent: 'stretch',
          overflowY: 'auto',
          mt: 3,
        }}
      >
        <Box
          sx={{
            marginBottom: 4,
          }}
        >
          <HeaderLoading />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flex: 'auto',
            flexDirection: optionConfig.useViewportQueries
              ? ['column', 'column', 'row', 'row']
              : breakpoint(['column', 'column', 'row', 'row']),
            justifyContent: 'stretch',
            gap: [2, 2, 2, 4],
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              width: optionConfig.useViewportQueries
                ? ['100%', '100%', 'auto', 'auto']
                : breakpoint(['100%', '100%', 'auto', 'auto']),
              backgroundColor: 'canvas.default',
              zIndex: 1,
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            <div>
              <IssueBodyLoading />
            </div>
            <div>
              <Box
                sx={{
                  mb: 3,
                }}
              >
                <IssueTimelineLoading />
              </Box>
            </div>
          </Box>

          <Box
            sx={{
              width: optionConfig.useViewportQueries
                ? ['auto', 'auto', '256px', '296px']
                : breakpoint(['auto', 'auto', '256px', '296px']),
              flexShrink: 0,
              pl: 2,
            }}
          >
            <SidebarSectionsLoading />
          </Box>
        </Box>
      </Box>
    </ContentWrapper>
  )
}
