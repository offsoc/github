import {ArrowLeftIcon} from '@primer/octicons-react'
import {Box, Button} from '@primer/react'

import {LABELS} from '../../notifications/constants/labels'
import {useAppNavigate} from '../../hooks/use-app-navigate'

const MobileBack = () => {
  const {navigateToUrl} = useAppNavigate()
  return (
    <Box sx={{display: ['flex', 'flex', 'flex', 'flex', 'none'], mb: 2}}>
      <Button
        variant="invisible"
        size="small"
        onClick={() => navigateToUrl(LABELS.inboxPath)}
        leadingVisual={ArrowLeftIcon}
        sx={{color: 'fg.muted', fontWeight: 'normal', px: 2, ml: -2}}
      >
        {LABELS.backToInbox}
      </Button>
    </Box>
  )
}

export default MobileBack
