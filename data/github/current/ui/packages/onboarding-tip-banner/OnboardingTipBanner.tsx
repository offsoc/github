import {Box, Link, Octicon, Text, Heading} from '@primer/react'
import type {PropsWithChildren} from 'react'
import type {Icon} from '@primer/octicons-react'
import {ArrowLeftIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useClickAnalytics} from '@github-ui/use-analytics'

export interface OnboardingTipBannerProps {
  link: string
  linkText: string
  heading: string
  icon: Icon
}

export function OnboardingTipBanner({
  children,
  link,
  linkText,
  heading,
  icon,
}: PropsWithChildren<OnboardingTipBannerProps>) {
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        marginBottom: 3,
        borderRadius: '2',
        backgroundColor: 'canvas.subtle',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'border.default',
        padding: 3,
      }}
    >
      <Box
        {...testIdProps('growth-onboardingTipBanner-icon')}
        sx={{
          width: '32px;',
          height: '32px;',
          borderRadius: '10%',
          bg: 'var(--display-purple-bgColor-emphasis, var(--color-scale-purple-4))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Octicon icon={icon} size={16} sx={{color: 'white'}} />
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <Link
          {...testIdProps('tip-return-link')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
          onClick={() =>
            sendClickAnalyticsEvent({
              category: 'advanced_security_onboarding_tip_banner',
              action: 'click_onboarding_tip_banner_return_link',
              label: `ref_cta:${linkText};ref_loc:repo_branches_listing;`,
            })
          }
          href={link}
        >
          <Octicon icon={ArrowLeftIcon} sx={{mr: 1}} />
          <span>{linkText}</span>
        </Link>
        <Heading as="h3" sx={{fontSize: 2, fontWeight: 'bold', mb: 1}}>
          {heading}
        </Heading>
        <Text {...testIdProps('tip-message')} sx={{fontSize: 1, fontWeight: 'normal', color: 'fg.muted'}}>
          {children}
        </Text>
      </Box>
    </Box>
  )
}
