import {getSignificanceBasedPrecision, human} from '@github-ui/formatters'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {useListViewVariant} from '@github-ui/list-view/ListViewVariantContext'
import {
  forksListPath,
  orgTopicReposPath,
  repoCommitActivityInsightsPath,
  repoIssuesPath,
  repoPullRequestsPath,
  repositoryParticipationPath,
  repositoryPath,
  repoStargazersPath,
} from '@github-ui/paths'
import type {PrimaryLanguage, RepositoryItem} from '@github-ui/repos-list-shared'
import {type SafeHTMLString, SafeHTMLText} from '@github-ui/safe-html'
import {ObservableBox} from '@github-ui/use-sticky-header/ObservableBox'
import {useIntersectionObserver} from '@github-ui/use-sticky-header/useIntersectionObserver'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {
  GitPullRequestIcon,
  type Icon,
  IssueOpenedIcon,
  LawIcon,
  RepoCloneIcon,
  RepoForkedIcon,
  RepoIcon,
  RepoLockedIcon,
  StarIcon,
} from '@primer/octicons-react'
import type {BaseStylesProps, SxProp} from '@primer/react'
import {Box, Label, Link, Octicon, RelativeTime, Text, Truncate} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo, useRef, useState} from 'react'

import {LanguageCircle} from './LanguageCircle'
import {Sparkline} from './Sparkline'

interface Props extends SxProp {
  repo: RepositoryItem
}

const smallScreenOnly: BaseStylesProps = {display: ['block', 'none']}
const hideOnSmallScreen: BaseStylesProps = {display: ['none', 'block']}

const MAX_TOPICS_WIDE_SCREEN = 10
const MAX_TOPICS_NARROW_SCREEN = 3

const sparklineWidth = 120
const tinySparklineWidth = 60

const listViewTruncatedHeaderSx: BetterSystemStyleObject = {
  fontSize: 2,
  fontWeight: 'semibold',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
}

const headerContainerSx: BetterSystemStyleObject = {display: 'inline-flex', alignItems: 'center', maxWidth: '100%'}

export const ReposListItem = memo(({repo}: Props) => {
  const {variant} = useListViewVariant()

  if (variant === 'default') {
    return (
      <ListItem title={<DefaultItemTitle repo={repo} />}>
        <DefaultItemContent repo={repo} />
      </ListItem>
    )
  }

  return (
    <ListItem
      sx={{display: ['block', 'grid'], gap: 2, '>*': {pr: 0}}}
      metadataContainerSx={{display: ['none', 'flex'], pr: 0, flexWrap: 'nowrap'}}
      metadata={<CompactItemMetadata repo={repo} />}
      title={<CompactItemTitle repo={repo} />}
    >
      <ListItemLeadingContent sx={{pl: 2, display: ['none', 'flex']}}>
        <ListItemLeadingVisual icon={getRepoIcon(repo)} color="fg.muted" />
      </ListItemLeadingContent>
      <ListItemMainContent>
        <CompactWideItemContent repo={repo} sx={{display: ['none', 'flex']}} />
        <CompactNarrowItemContent repo={repo} sx={{display: ['flex', 'none']}} />
      </ListItemMainContent>
    </ListItem>
  )
})

ReposListItem.displayName = 'ReposListItem'

function DefaultItemContent({repo}: Props) {
  const {description, lastUpdated, license, allTopics} = repo
  return (
    <ListItemMainContent>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          color: 'fg.muted',
          gap: 2,
          width: ['100%', '100%', `calc(100% - ${sparklineWidth}px)`],
          pl: 2,
        }}
      >
        {description && (
          <ListItemDescription>
            <FormattedDescription sx={{fontSize: 1}} description={description} />
          </ListItemDescription>
        )}

        {allTopics.length > 0 && <TopicsLabels {...repo} />}

        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', fontSize: 0}}>
          <LanguageLabel {...repo} />
          {repo.primaryLanguage && <span>•</span>}

          {license && (
            <>
              <LicenseLabel {...repo} />
              <span>•</span>
            </>
          )}

          <ForksLabel {...repo} />
          <span>•</span>

          <StarsLabel {...repo} />
          <span>•</span>

          {repo.issueCount !== null && (
            <>
              <IssuesLabel issueCount={repo.issueCount} owner={repo.owner} name={repo.name} />
              <span>•</span>
            </>
          )}

          {repo.pullRequestCount !== null && (
            <>
              <PullRequestsLabel pullRequestCount={repo.pullRequestCount} owner={repo.owner} name={repo.name} />
              <span>•</span>
            </>
          )}

          <Text sx={{overflow: 'hidden', whiteSpace: 'nowrap', ...hideOnSmallScreen}}>
            {lastUpdated.hasBeenPushedTo ? 'Updated' : 'Created'} <RelativeTime datetime={lastUpdated.timestamp} />
          </Text>

          <RelativeTime datetime={lastUpdated.timestamp} format="micro" sx={{...smallScreenOnly}} />
        </Box>
      </Box>
    </ListItemMainContent>
  )
}

function CompactNarrowItemContent({repo, sx = {}}: Props) {
  const {description} = repo
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        color: 'fg.muted',
        gap: 2,
        width: '100%',
        px: 3,
        pb: 2,
        ...sx,
      }}
    >
      {description && (
        <ListItemDescription>
          <FormattedDescription sx={{fontSize: 1}} description={description} />
        </ListItemDescription>
      )}

      <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', fontSize: 0}}>
        <LanguageLabel {...repo} />
        {repo.primaryLanguage && <span>•</span>}

        <ForksLabel {...repo} />
        <span>•</span>

        <StarsLabel {...repo} />
        <span>•</span>

        {repo.pullRequestCount !== null && (
          <PullRequestsLabel pullRequestCount={repo.pullRequestCount} owner={repo.owner} name={repo.name} />
        )}
      </Box>
    </Box>
  )
}

function CompactWideItemContent({repo, sx = {}}: Props) {
  const {description} = repo
  return (
    <ListItemDescription sx={{minWidth: 0, fontSize: 1, ...sx}}>
      <Truncate inline title={description} sx={{maxWidth: '100%'}}>
        <FormattedDescription description={description} />
      </Truncate>
    </ListItemDescription>
  )
}

function DefaultItemTitle({repo}: Props) {
  const {name, type, owner} = repo

  return (
    <ListItemTitle
      value={name}
      href={repositoryPath({owner, repo: name})}
      headingSx={{pl: 2, ...listViewTruncatedHeaderSx}}
      containerSx={{...headerContainerSx, gap: 1}}
    >
      <Label variant="secondary">{type}</Label>
      <ParticipationSparkline repo={repo} />
    </ListItemTitle>
  )
}

function CompactItemTitle({repo}: Props) {
  const {name, type, owner} = repo

  return (
    <ListItemTitle
      value={name}
      href={repositoryPath({owner, repo: name})}
      headingSx={listViewTruncatedHeaderSx}
      containerSx={{
        ...headerContainerSx,
        gap: [1, 0],
        px: [3, 0],
      }}
    >
      <Label variant="secondary" sx={{display: ['flex', 'none']}}>
        {type}
      </Label>
    </ListItemTitle>
  )
}

const compactMetadataSx: BaseStylesProps = {fontSize: 1}
function CompactItemMetadata({repo}: Props) {
  return (
    <>
      <ListItemMetadata sx={{...compactMetadataSx, width: '90px'}}>
        <LanguageLabel truncate {...repo} />
      </ListItemMetadata>

      <ListItemMetadata sx={{...compactMetadataSx, alignSelf: 'center', width: '52px'}}>
        <ForksLabel {...repo} />
      </ListItemMetadata>

      <ListItemMetadata sx={{...compactMetadataSx, alignSelf: 'center', width: '52px'}}>
        <StarsLabel {...repo} />
      </ListItemMetadata>
    </>
  )
}

function getRepoIcon(repo: RepositoryItem) {
  const {isFork, type} = repo
  const lowerCaseType = type.toLowerCase()

  let icon
  if (isFork) {
    icon = RepoForkedIcon
  } else if (lowerCaseType.includes('mirror')) {
    icon = RepoCloneIcon
  } else if (lowerCaseType.includes('private') || lowerCaseType.includes('internal')) {
    icon = RepoLockedIcon
  } else {
    icon = RepoIcon
  }

  return icon
}

function pluralizeTopic(count: number) {
  return count === 1 ? 'topic' : 'topics'
}

function TopicLabel({topic, owner, sx = {}}: {topic: string; owner: string; sx?: BaseStylesProps}) {
  return (
    <Link key={topic} href={orgTopicReposPath({topic, org: owner})} data-testid={`${topic}-topic-link`} sx={sx}>
      <Label
        size="large"
        sx={{
          border: '0',
          color: 'accent.fg',
          backgroundColor: 'accent.subtle',
          fontWeight: 500,
          '&:hover': {
            color: 'fg.onEmphasis',
            backgroundColor: 'accent.fg',
          },
        }}
      >
        {topic}
      </Label>
    </Link>
  )
}

function MoreTopicsButton({
  notShown,
  sx,
  setIsOpen,
}: {
  notShown: number
  sx: BaseStylesProps
  setIsOpen: (value: boolean) => void
}) {
  return notShown > 0 ? (
    <Label
      as="button"
      aria-label={`Show ${notShown} more ${pluralizeTopic(notShown)}`}
      sx={{fontWeight: 500, ...sx}}
      size="large"
      variant="secondary"
      onClick={() => setIsOpen(true)}
    >
      + {notShown}
    </Label>
  ) : null
}

function TopicsLabels({allTopics, owner, name}: {allTopics: string[]; owner: string; name: string}) {
  const [isOpen, setIsOpen] = useState(false)

  const narrowTopicNames = allTopics.slice(0, MAX_TOPICS_NARROW_SCREEN)
  const narrowTopicsNotShown = allTopics.length - MAX_TOPICS_NARROW_SCREEN

  const wideOnlyTopicNames = allTopics.slice(MAX_TOPICS_NARROW_SCREEN, MAX_TOPICS_WIDE_SCREEN)
  const topicsNotShown = Math.max(0, allTopics.length - MAX_TOPICS_WIDE_SCREEN)

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {narrowTopicNames.map(topic => (
        <TopicLabel key={topic} topic={topic} owner={owner} />
      ))}
      <MoreTopicsButton notShown={narrowTopicsNotShown} sx={smallScreenOnly} setIsOpen={setIsOpen} />

      {wideOnlyTopicNames.map(topic => (
        <TopicLabel key={topic} topic={topic} owner={owner} sx={hideOnSmallScreen} />
      ))}
      <MoreTopicsButton notShown={topicsNotShown} sx={hideOnSmallScreen} setIsOpen={setIsOpen} />

      {isOpen && (
        <Dialog
          title={`Topics for ${owner}/${name}`}
          width="small"
          position={{narrow: 'bottom', wide: 'center'}}
          footerButtons={[{content: 'Done', onClick: () => setIsOpen(false)}]}
          onClose={() => setIsOpen(false)}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {allTopics.map(topic => (
              <Link
                key={topic}
                href={orgTopicReposPath({topic, org: owner})}
                data-testid={`dialog-${topic}-topic-link`}
              >
                <Label
                  size="large"
                  sx={{
                    border: '0',
                    color: 'accent.fg',
                    backgroundColor: 'accent.subtle',
                    fontWeight: 500,
                    '&:hover': {
                      color: 'fg.onEmphasis',
                      backgroundColor: 'accent.fg',
                    },
                  }}
                >
                  {topic}
                </Label>
              </Link>
            ))}
          </Box>
        </Dialog>
      )}
    </Box>
  )
}

function LanguageLabel({primaryLanguage, truncate}: {primaryLanguage: PrimaryLanguage | null; truncate?: boolean}) {
  if (!primaryLanguage) {
    return null
  }

  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
      <LanguageCircle color={primaryLanguage.color} />
      {truncate ? (
        <Truncate inline title={primaryLanguage.name} sx={{maxWidth: 70}}>
          {primaryLanguage.name}
        </Truncate>
      ) : (
        <Text sx={{whiteSpace: 'nowrap'}}>{primaryLanguage.name}</Text>
      )}
    </Box>
  )
}

function LicenseLabel({license}: {license: string | null}) {
  if (!license) {
    return null
  }

  return <IconLabel content={license} icon={LawIcon} />
}

function StarsLabel({starsCount, owner, name}: {starsCount: number; owner: string; name: string}) {
  const count = human(starsCount, {precision: getSignificanceBasedPrecision(starsCount)})
  const unit = count === '1' ? 'star' : 'stars'
  const label = `${count} ${unit}`
  return <IconLabel aria-label={label} content={count} icon={StarIcon} href={repoStargazersPath(owner, name)} />
}

function ForksLabel({forksCount, owner, name}: {forksCount: number; owner: string; name: string}) {
  const count = human(forksCount, {precision: getSignificanceBasedPrecision(forksCount)})
  const unit = count === '1' ? 'fork' : 'forks'
  const label = `${count} ${unit}`
  return (
    <IconLabel aria-label={label} content={count} icon={RepoForkedIcon} href={forksListPath({owner, repo: name})} />
  )
}

function IssuesLabel({issueCount, owner, name}: {issueCount: number; owner: string; name: string}) {
  const count = human(issueCount, {precision: getSignificanceBasedPrecision(issueCount)})
  const unit = count === '1' ? 'issue' : 'issues'
  const label = `${count} ${unit}`
  return (
    <IconLabel
      aria-label={label}
      data-testid={'issue-count'}
      content={count}
      icon={IssueOpenedIcon}
      href={repoIssuesPath(owner, name)}
    />
  )
}

function PullRequestsLabel({pullRequestCount, owner, name}: {pullRequestCount: number; owner: string; name: string}) {
  const count = human(pullRequestCount, {precision: getSignificanceBasedPrecision(pullRequestCount)})
  const unit = count === '1' ? 'pull request' : 'pull requests'
  const label = `${count} ${unit}`
  return (
    <IconLabel
      aria-label={label}
      data-testid={'pull-request-count'}
      content={count}
      icon={GitPullRequestIcon}
      href={repoPullRequestsPath(owner, name)}
    />
  )
}

const labelContainerSx = {display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap'}
function IconLabel({
  icon,
  href,
  content,
  ...props
}: {
  icon: Icon
  href?: string
  content: string
  ['aria-label']?: string
}) {
  if (href) {
    return (
      <Link {...props} muted={true} sx={labelContainerSx} href={href}>
        <Octicon icon={icon} />
        {content}
      </Link>
    )
  }

  return (
    <Box {...props} sx={labelContainerSx}>
      <Octicon icon={icon} />
      {content}
    </Box>
  )
}

function ParticipationSparkline({repo, sx}: Props) {
  const [participation, setParticipation] = useState(repo.participation)
  const isFetchingRef = useRef(false)

  async function fetchParticipation() {
    if (participation || isFetchingRef.current) return
    isFetchingRef.current = true

    const response = await verifiedFetchJSON(repositoryParticipationPath({owner: repo.owner, repo: repo.name}))
    if (response.ok) {
      const bodyText = await response.text()
      const json = bodyText.length > 0 ? JSON.parse(bodyText) : []
      setParticipation(json)
    }
  }

  const [observeRow, unobserveRow] = useIntersectionObserver(entries => {
    if (entries[0]?.isIntersecting) {
      fetchParticipation()
    }
  })

  return participation ? (
    participation.length === 0 ? (
      <div data-testid="empty-repo-sparkline" />
    ) : (
      <Box sx={{ml: 'auto', pr: 2, ...sx}}>
        <Link
          href={repoCommitActivityInsightsPath({owner: repo.owner, repo: repo.name})}
          aria-label={`${repo.owner}/${repo.name} past year of commit activity`}
          target="_blank"
        >
          <Box sx={hideOnSmallScreen}>
            <Sparkline uniqueKey={repo.name} points={participation} width={sparklineWidth} />
          </Box>
          <Box sx={smallScreenOnly}>
            <Sparkline uniqueKey={`${repo.name}#tiny`} points={participation} width={tinySparklineWidth} />
          </Box>
        </Link>
      </Box>
    )
  ) : (
    <ObservableBox role="presentation" onObserve={observeRow} onUnobserve={unobserveRow} />
  )
}

function FormattedDescription({description, sx}: {description: SafeHTMLString; sx?: BaseStylesProps}) {
  // `repos-list-description` class is required to support `Link underlines` user setting
  return <SafeHTMLText sx={sx} className="repos-list-description" html={description} />
}
