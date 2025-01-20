import {Text} from '@primer/react'
import {Banner} from '@primer/react/drafts'
import {usePipelineDetails} from '../PipelineDetails'
import {isListItemStyle} from './shared'
import {BannerTitle} from './BannerTitle'

interface Props {
  isListItem?: boolean
}

export function InProgressBanner({isListItem = false}: Props) {
  const {adminEmail, hasAnyDeployed} = usePipelineDetails()

  return (
    <Banner
      description={
        <>
          <BannerTitle isListItem={isListItem}>Training</BannerTitle>
          <Text sx={{wordBreak: 'break-word'}}>
            This may take awhile.{' '}
            {!!adminEmail && (
              <span>
                We&apos;ll notify you at <Text sx={{fontWeight: 'semibold'}}>{adminEmail}</Text> once training is
                complete.
              </span>
            )}{' '}
            {hasAnyDeployed && <span>Your existing model is still deployed.</span>}
          </Text>
        </>
      }
      style={isListItem ? isListItemStyle : undefined}
      variant="info"
    />
  )
}
