import {testIdProps} from '@github-ui/test-id-props'
import {ChevronLeftIcon} from '@primer/octicons-react'
import {Box, Breadcrumbs, IconButton, Text, Truncate} from '@primer/react'
import type {MouseEventHandler} from 'react'

export const SidePanelBreadcrumbs: React.FC<{
  items: Array<{url: string; repoName: string; repoIcon?: JSX.Element; issueNumber: string; id: number}>
  onClick?: MouseEventHandler<HTMLElement>
}> = ({items, onClick}) => {
  const contents = (
    <Breadcrumbs>
      {items.map(({url, repoName, repoIcon, issueNumber, id}, index) => (
        <Breadcrumbs.Item
          sx={{color: 'fg.muted', fontSize: 'fontSizes.1'}}
          key={index}
          data-id={id}
          href={url}
          selected={index === items.length - 1}
          target="_blank"
          data-hovercard-type="issue"
          data-hovercard-url={`${url}/hovercard`}
          onClick={onClick ?? undefined}
        >
          {repoIcon && <Text sx={{mr: 1}}>{repoIcon}</Text>}
          <Truncate
            inline
            as="span"
            title={`${repoName} ${issueNumber}`}
            sx={{
              maxWidth: index === items.length - 1 ? 'none' : '150px',
              textDecoration: 'inherit',
            }}
          >
            {repoName}
          </Truncate>
          <span>{repoName ? ` ${issueNumber}` : issueNumber}</span>
        </Breadcrumbs.Item>
      ))}
    </Breadcrumbs>
  )

  return (
    <Box sx={{display: 'flex'}}>
      <Box sx={{ml: -3, mr: 1, mt: '2px'}}>
        {items.length > 1 ? (
          <IconButton
            {...testIdProps('side-panel-nav-button-up')}
            aria-label="Navigate up one level"
            disabled={items.length === 1 || !onClick}
            icon={ChevronLeftIcon}
            onClick={onClick}
            variant="invisible"
            sx={{
              color: 'fg.muted',
              ':hover': {
                bg: 'transparent',
                boxShadow: 'none',
              },
              ':disabled': {
                color: 'fg.muted',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pr: 2,
              py: 0,
              pt: '4px',
              pl: '8px',
              height: 18,
              width: 18,
              '& svg': {
                verticalAlign: 'top!important',
              },
            }}
          />
        ) : (
          // Placeholder for icon with first breadcrumb to prevent bounce
          <Box sx={{ml: '10px', mt: '2px'}} />
        )}
      </Box>
      {contents}
    </Box>
  )
}
