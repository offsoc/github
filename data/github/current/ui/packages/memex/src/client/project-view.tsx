import {testIdProps} from '@github-ui/test-id-props'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {InfoIcon, StopIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, Flash, IconButton, Link, Octicon, Text} from '@primer/react'
import {forwardRef, memo, useCallback, useEffect, useRef, useState} from 'react'

import {apiMemexWithoutLimitsBetaSignup} from './api/memex/api-post-beta-signup'
import type {BetaSignupBannerState} from './api/memex/contracts'
import {apiDismissNotice} from './api/notice/api-dismiss-notice'
import {DeletedViewToastUI} from './api/stats/contracts'
import {Board} from './components/board/board'
import {Blankslate} from './components/common/blankslate'
import {ReactTable} from './components/react_table/react-table'
import {TableColumnsProviderForTable} from './components/react_table/state-providers/table-columns/table-columns-provider-for-table'
import {IconContainer, stateColorMap, StyledToast, ToastAction, WarningIcon} from './components/toasts/toast'
import useToasts, {ToastType} from './components/toasts/use-toasts'
import {ViewNavigation} from './components/view-navigation'
import {useFieldCommands} from './features/fields/hooks/use-field-commands'
import {useHorizontalGroupCommands} from './features/grouping/hooks/use-horizontal-group-commands'
import {useSliceBy} from './features/slicing/hooks/use-slice-by'
import {useSliceByCommands} from './features/slicing/hooks/use-slice-by-commands'
import {getInitialState} from './helpers/initial-state'
import {shortcutFromEvent, SHORTCUTS} from './helpers/keyboard-shortcuts'
import {ViewType} from './helpers/view-type'
import {useSortCommands} from './hooks/command-palette/use-sort-commands'
import {usePrefixedId} from './hooks/common/use-prefixed-id'
import {useApiRequest} from './hooks/use-api-request'
import {useBindMemexToDocument} from './hooks/use-bind-memex-to-document'
import {useEnabledFeatures} from './hooks/use-enabled-features'
import {useViewType} from './hooks/use-view-type'
import {useViews} from './hooks/use-views'
import {RoadmapView} from './pages/roadmap/components/roadmap-view'
import {TableColumnsProviderForRoadmap} from './pages/roadmap/table-columns-provider-for-roadmap'
import {KeyPressProvider} from './state-providers/keypress/key-press-provider'
import {useMemexServiceQuery} from './state-providers/memex-service/use-memex-service-query'
import {Resources} from './strings'

export function ProjectView() {
  useBindMemexToDocument()

  const {memex_disable_autofocus} = useEnabledFeatures()

  const {data: memexServiceData} = useMemexServiceQuery()
  const betaSignupBannerState = memexServiceData?.betaSignupBanner
  const initialBetaBannerVisibility = betaSignupBannerState === 'visible' || betaSignupBannerState === 'staffship'

  const [betaBannerVisibile, setBetaBannerVisibility] = useState(initialBetaBannerVisibility)

  const mwlKillSwitchEnabled = memexServiceData?.killSwitchEnabled
  const mwlKillSwitchRecentlyDisabled = memexServiceData?.killSwitchRecentlyDisabled

  const viewRef = useRef<ProjectViewInnerRef>(null)
  const focusIn = useCallback(() => viewRef.current?.focusIn(), [])

  // If the user presses the down arrow before focusing anything, jump focus into the current view
  useEffect(() => {
    if (!memex_disable_autofocus) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (shortcutFromEvent(event) === SHORTCUTS.ARROW_DOWN && document.activeElement === document.body) {
        event.preventDefault() // prevent scrolling down
        viewRef.current?.focusIn()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [memex_disable_autofocus])

  const projectViewId = usePrefixedId('project-view')
  return (
    <Box
      id="memex-project-view-root"
      {...testIdProps('app-root')}
      sx={{
        flexDirection: 'column',
        flex: 'auto',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        height: '100%',
      }}
    >
      <ViewNavigation projectViewId={projectViewId} onFocusIntoCurrentView={focusIn} />
      <Box
        id={projectViewId}
        role="tabpanel"
        sx={{
          flexDirection: 'column',
          flex: 'auto',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
        }}
      >
        {betaBannerVisibile && (
          <ProjectViewWithoutLimitsWaitlistBanner
            bannerType={betaSignupBannerState}
            setBetaBannerVisibility={setBetaBannerVisibility}
          />
        )}

        {mwlKillSwitchEnabled && <ProjectViewWithoutLimitsDisabledBanner />}
        {mwlKillSwitchRecentlyDisabled && <ProjectViewWithoutLimitsReEnabledBanner />}
        <MainView ref={viewRef} />
      </Box>
    </Box>
  )
}

function ProjectViewWithoutLimitsDisabledBanner() {
  return (
    <Flash variant="warning" sx={{mx: 1, mt: 1}} {...testIdProps('mwl-disabled-banner')}>
      {Resources.killSwitchEnabledBanner}
    </Flash>
  )
}

function ProjectViewWithoutLimitsReEnabledBanner() {
  return (
    <Flash variant="default" sx={{mx: 1, mt: 1}} {...testIdProps('mwl-re-enabled-banner')}>
      {Resources.mwlReEnabledBanner}
    </Flash>
  )
}

function ProjectViewWithoutLimitsWaitlistBanner({
  setBetaBannerVisibility,
  bannerType,
}: {
  setBetaBannerVisibility: (visible: boolean) => void
  bannerType: BetaSignupBannerState | undefined
}) {
  const {addToast} = useToasts()
  const addToastRef = useTrackingRef(addToast)

  const postBetaSignup = useCallback(async () => {
    const response = await apiMemexWithoutLimitsBetaSignup()
    if (response.success) {
      setBetaBannerVisibility(false)
      addToastRef.current({
        message: Resources.betaSignupSuccessMessage,
        type: ToastType.success,
      })
    }
  }, [addToastRef, setBetaBannerVisibility])

  const dismissNotice = useCallback(async () => {
    const response = await apiDismissNotice({notice: 'memex_without_limits_beta'})
    if (response.success) {
      setBetaBannerVisibility(false)
    } else {
      addToastRef.current({
        message: Resources.dismissNoticeError,
        type: ToastType.error,
      })
    }
  }, [addToastRef, setBetaBannerVisibility])

  const {perform: join} = useApiRequest({request: postBetaSignup})
  const {perform: dismiss} = useApiRequest({request: dismissNotice})

  const onJoinWaitlist = useCallback(() => join(), [join])
  const onDismissNotice = useCallback(() => dismiss(), [dismiss])

  let testId = 'no-project-limits-waitlist-banner'
  let ctaText = Resources.joinWaitlist
  let bannerText = Resources.noProjectLimitWaitlistBanner
  const learnMoreHref = getInitialState().pwlBetaFeedbackLink

  if (bannerType === 'staffship') {
    testId = 'no-project-limits-waitlist-staffship-banner'
    ctaText = Resources.joinBeta
    bannerText = Resources.noProjectLimitWaitlistStaffshipBanner
  }

  return (
    <Flash
      {...testIdProps(testId)}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'min-content 1fr minmax(0, auto)',
        gridTemplateRows: 'min-content',
        gridTemplateAreas: `'visual message actions close'`,
        '@media screen and (max-width: 543.98px)': {
          gridTemplateColumns: 'min-content 1fr',
          gridTemplateRows: 'min-content min-content',
          gridTemplateAreas: `
        'visual message close'
        '.      actions actions'
      `,
        },
      }}
      full
    >
      <Box sx={{display: 'grid', paddingBlock: 'var(--base-size-8)', alignSelf: 'start', gridArea: 'visual'}}>
        <Octicon icon={InfoIcon} />
      </Box>
      <Box
        sx={{
          fontSize: 1,
          lineHeight: '1.5',
          padding: '0.375rem var(--base-size-8)',
          alignSelf: 'center',
          gridArea: 'message',
        }}
      >
        {bannerText} <Link href={learnMoreHref}> Learn more</Link>
      </Box>
      <Box
        sx={{
          gridArea: 'actions',
          '@media screen and (max-width: 543.98px)': {
            alignSelf: 'start',
            margin: 'var(--base-size-8) 0 0 var(--base-size-8)',
          },
        }}
      >
        <Button tabIndex={0} onClick={onJoinWaitlist}>
          {ctaText}
        </Button>
      </Box>
      <IconButton
        icon={XIcon}
        aria-label="Dismiss alert"
        variant="invisible"
        sx={{
          gridArea: 'close',
          float: 'right',
          marginLeft: 'calc(var(--base-size-4))',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'none',
          border: 0,
          appearance: 'none',
          '&:hover': {
            opacity: 0.7,
          },
          '&:active': {
            opacity: 0.5,
          },
          '& .octicon': {
            marginRight: 0,
          },
        }}
        onClick={onDismissNotice}
      />
    </Flash>
  )
}

interface ProjectViewInnerProps {
  type: ViewType
}

interface ProjectViewInnerRef {
  focusIn: () => void
}

export const ProjectViewInner = forwardRef<ProjectViewInnerRef, ProjectViewInnerProps>(function ProjectViewInner(
  {type},
  ref,
) {
  switch (type) {
    case ViewType.Table:
      return (
        <KeyPressProvider>
          <TableColumnsProviderForTable>
            <ReactTable ref={ref} />
          </TableColumnsProviderForTable>
        </KeyPressProvider>
      )

    case ViewType.Roadmap:
      return (
        <KeyPressProvider>
          <TableColumnsProviderForRoadmap>
            <RoadmapView ref={ref} />
          </TableColumnsProviderForRoadmap>
        </KeyPressProvider>
      )
    case ViewType.List:
    default:
      return (
        <KeyPressProvider>
          <Board ref={ref} />
        </KeyPressProvider>
      )
  }
})

const MainView = memo(
  forwardRef<ProjectViewInnerRef>(function MainView(_, ref) {
    const {currentView, views, duplicateCurrentViewState} = useViews()
    const {
      partialFailures,
      projectLimits: {viewsLimit},
    } = getInitialState()
    const {viewType} = useViewType()
    const {addToast} = useToasts()
    const addToastRef = useTrackingRef(addToast)
    const {sliceField} = useSliceBy()

    useEffect(() => {
      const partialFailure = partialFailures?.[0]
      if (partialFailure) {
        addToastRef.current({
          message: partialFailure.message,
          type: ToastType.warning,
          keepAlive: true,
        })
      }
    }, [partialFailures, addToastRef])

    useSortCommands()
    useHorizontalGroupCommands()
    useFieldCommands()
    useSliceByCommands()

    if (!currentView) {
      return <NoViewFound />
    }

    return (
      <>
        {sliceField ? (
          <Box
            sx={{
              flexDirection: 'row',
              flex: 'auto',
              display: 'flex',
            }}
          >
            <Box
              sx={{
                flexDirection: 'column',
                flex: 'auto',
                display: 'grid',
                overflow: 'auto',
                gridTemplateColumns: 'auto 1fr',
                gridTemplateRows: 'auto 1fr',
              }}
            >
              <ProjectViewInner type={viewType} ref={ref} />
            </Box>
          </Box>
        ) : (
          <ProjectViewInner type={viewType} ref={ref} />
        )}
        {currentView.isDeleted ? (
          /**
           * We re-implement the toast here because we need a slightly tweaked
           * version of it, and want it to be static. We don't have a super easy
           * path to doing this re-using the definition of the Toast component currently,
           * but it might be a good place to unify these later
           */
          <StyledToast role="status" {...testIdProps('deleted-view-toast')}>
            <IconContainer sx={{bg: stateColorMap[ToastType.warning]}}>{WarningIcon}</IconContainer>
            <Box sx={{py: 1}}>
              <Text sx={{fontSize: 1, mx: 2, color: 'fg.onEmphasis'}}>This view has been deleted.</Text>
              {views.length < viewsLimit ? (
                <ToastAction
                  {...testIdProps('deleted-view-toast-action')}
                  sx={{
                    mt: 0,
                    mb: 0,
                  }}
                  onClick={() => {
                    duplicateCurrentViewState(currentView.number, undefined, {ui: DeletedViewToastUI})
                  }}
                >
                  {currentView.isViewStateDirty ? 'Save a copy to make changes.' : 'Duplicate it to make changes.'}
                </ToastAction>
              ) : null}
            </Box>
          </StyledToast>
        ) : null}
      </>
    )
  }),
)

const NoViewFound = memo(function NoViewFound() {
  return (
    <Blankslate
      sx={{
        backgroundColor: theme => `${theme.colors.canvas.default}`,
        display: 'flex',
        flexGrow: 1,
      }}
      data-hpc
    >
      <Octicon icon={StopIcon} size={30} sx={{color: 'danger.fg'}} />
      <h2>This view no longer exists</h2>
      <Text as="p" sx={{color: 'fg.muted'}}>
        Select another view to use this project.
      </Text>
    </Blankslate>
  )
})
