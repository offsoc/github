import {VALUES} from '@github-ui/commenting/Values'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {AlertIcon, InfoIcon, StopIcon} from '@primer/octicons-react'
import {Box, Button, Octicon, Text, Truncate} from '@primer/react'

import type {CommentAuthor, DiffAnnotation} from '../types'
import {DiffAnnotationLevels} from '../types'
import {AnnotationPresentationMap} from './AnnotationIcon'

const IconMap = {
  [DiffAnnotationLevels.Failure]: <Octicon icon={StopIcon} sx={{fill: 'danger.fg'}} />,
  [DiffAnnotationLevels.Warning]: <Octicon icon={AlertIcon} sx={{fill: 'attention.fg'}} />,
  [DiffAnnotationLevels.Notice]: <Octicon icon={InfoIcon} sx={{fill: 'fg.muted'}} />,
}

/**
 * A check annotation
 * Preferred method is to pass in ghostUser from the app payload
 * Because this is a shared package, ghostUser is optional and will default to constants
 */

export type AnnotationProps = {
  annotation: DiffAnnotation
  ghostUser?: CommentAuthor
}

export function Annotation({annotation, ghostUser = VALUES.ghostUser}: AnnotationProps) {
  const lineClampStyles = {
    display: '-webkit-box',
    overflow: 'hidden',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': '8',
    maxWidth: 'unset',
  }

  const checkSuiteApp = annotation.checkSuite.app

  return (
    <Box
      sx={{
        borderLeft: '6px solid',
        borderColor: AnnotationPresentationMap[annotation.annotationLevel].primaryColor,
        p: 4,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
        {IconMap[annotation.annotationLevel]}
        <Text sx={{fontWeight: 600, color: 'fg.muted', fontSize: 0, pl: 2}}>
          {AnnotationPresentationMap[annotation.annotationLevel].ariaLabel}
        </Text>
      </Box>
      <Text
        sx={{color: AnnotationPresentationMap[annotation.annotationLevel].primaryColor, fontWeight: 600, fontSize: 1}}
      >
        {annotation.title}
      </Text>
      <Box sx={{mb: 3, mt: 1}}>
        {annotation.message && (
          <Text sx={{fontFamily: 'var(--fontStack-monospace)', fontSize: 0, ...lineClampStyles}}>
            {annotation.message}
          </Text>
        )}
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Box sx={{flexGrow: 2}}>
          <GitHubAvatar
            src={checkSuiteApp?.logoUrl ?? ghostUser.avatarUrl}
            alt={`${checkSuiteApp?.name ?? ghostUser.login} avatar image`}
            data-testid="check-suite-app-avatar"
          />
          <Truncate
            sx={{ml: 2, maxWidth: '300px'}}
            inline={true}
            title={`${annotation.checkSuite.name} / ${annotation.checkRun.name}`}
          >
            <Text sx={{fontWeight: 600, fontSize: 0}}>{annotation.checkSuite.name}</Text> /{' '}
            <Text sx={{fontSize: 0}}>{annotation.checkRun.name}</Text>
          </Truncate>
        </Box>
        {annotation.checkRun.detailsUrl && (
          <Button as="a" href={annotation.checkRun.detailsUrl} size="small">
            View details
          </Button>
        )}
      </Box>
    </Box>
  )
}
