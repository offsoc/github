import {CheckIcon, LinkExternalIcon} from '@primer/octicons-react'
import {Box, Octicon, Text} from '@primer/react'
import {Dialog} from '@primer/react/lib-esm/Dialog/Dialog'
import {useCallback, useState} from 'react'

import {InsightsUpsellDialogOpen, InsightsUpsellDialogUpgradeClick} from '../../../api/stats/contracts'
import {useThemedMediaUrl} from '../../../helpers/media-urls'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {InsightsResources} from '../../../strings'
import {useInsightsEnabledFeatures} from '../hooks/use-insights-features'

/**
 * Encapsulates logic for hiding / showing a dialog for the Insights Upsell Experience.
 *
 * The returned `InsightsUpsellDialog` component should be rendered in the component
 * tree like `<InsightsUpsellDialog />`.
 *
 * Then, calling `showDialog()` will set local state to render the underlying dialog component.
 */
export function useInsightsUpsellDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const {postStats} = usePostStats()
  const showDialog = useCallback(() => {
    setIsOpen(true)
    postStats({name: InsightsUpsellDialogOpen})
  }, [postStats])
  const hideDialog = useCallback(() => setIsOpen(false), [])
  const InsightsUpsellDialog = useCallback(
    () => (isOpen ? <UpsellDialog hideDialog={hideDialog} /> : null),
    [hideDialog, isOpen],
  )

  return {showDialog, InsightsUpsellDialog}
}

function UpsellDialog({hideDialog}: {hideDialog: () => void}) {
  const {savedChartsLimit} = useInsightsEnabledFeatures()
  const upsellDialogImgSrc = useThemedMediaUrl('insightsChartLimitDialog', 'banner')
  const {postStats} = usePostStats()

  return (
    <Dialog
      aria-labelledby="insights-chart-limits-dialog-title"
      onClose={() => hideDialog()}
      width="xlarge"
      role="alertdialog"
      renderHeader={() => (
        <Box
          sx={{
            backgroundImage: `url(${upsellDialogImgSrc})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left',
            backgroundSize: '100%',
            height: '142px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        />
      )}
      footerButtons={[
        {
          content: InsightsResources.upsellDialogCancelButton,
          onClick: () => hideDialog(),
        },
        {
          // @ts-expect-error dialog footer buttons do not support `as` prop
          as: 'a',
          buttonType: 'primary',
          content: (
            <>
              <Octicon icon={LinkExternalIcon} sx={{mr: 1}} />
              {InsightsResources.upsellDialogUpgradePlanButton}
            </>
          ),
          // https://github.com/primer/react/issues/2118
          // Buttons cannot currently accept `href` as a prop in the types,
          // but the value does get plumbed through to the underlying `a` element.
          href: 'https://github.com/pricing',
          sx: {
            ml: 3,
          },
          target: '_blank',
          rel: 'noreferrer',
          onClick: () => postStats({name: InsightsUpsellDialogUpgradeClick}),
        },
      ]}
    >
      <Text id="insights-chart-limits-dialog-title" sx={{fontSize: 4, fontWeight: 'bold', my: 3, px: 3}}>
        {InsightsResources.upsellDialogTitle}
      </Text>

      <Box sx={{display: 'flex', flexDirection: 'column', mt: 2, px: 3}}>
        <span>{InsightsResources.planUpgradeText(savedChartsLimit)}</span>

        <Text sx={{fontWeight: 'bold', mt: 2}}>{InsightsResources.upsellDialogSubtitle}</Text>

        <UpsellDialogChecklistItem text={InsightsResources.upsellDialogBullet1} />
        <UpsellDialogChecklistItem text={InsightsResources.upsellDialogBullet2} />
        <UpsellDialogChecklistItem text={InsightsResources.upsellDialogBullet3} />
      </Box>
    </Dialog>
  )
}

function UpsellDialogChecklistItem({text}: {text: string}) {
  return (
    <Box sx={{mt: 2}}>
      <Octicon sx={{mr: 2, color: 'success.fg'}} icon={CheckIcon} /> <span>{text}</span>
    </Box>
  )
}
