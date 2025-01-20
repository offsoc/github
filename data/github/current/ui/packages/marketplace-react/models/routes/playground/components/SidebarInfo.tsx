import {useState} from 'react'
import {Text, Box, CounterLabel, Link, Label} from '@primer/react'
import {EllipsisIcon} from '@primer/octicons-react'
import type {Model} from '../../../../types'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

export type Labels = {
  task: string
  tags: string[]
}

export function TagsSection({labels}: {labels: Labels}) {
  const searchFiltersFeatureFlag = useFeatureFlag('project_neutron_filtering')

  const {tags, task} = labels

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 2,
      }}
    >
      <Heading title="Tags" count={tags.length} />
      {tags.length > 0 && (
        <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
          {tags.map(tag => {
            if (searchFiltersFeatureFlag) {
              // categories cannot contain `-` characters, or ES wil analyze them as separate words
              const category = tag.toLowerCase().split('-')[0]

              return (
                <a
                  href={`/marketplace?type=models&category=${category}`}
                  key={tag}
                  className="topic-tag topic-tag-link"
                >
                  {tag}
                </a>
              )
            } else {
              return (
                <Label key={tag} size="large" variant="secondary">
                  {tag}
                </Label>
              )
            }
          })}

          {task &&
            (searchFiltersFeatureFlag ? (
              <a href={`/marketplace?type=models&task=${task}`} key={task} className="topic-tag topic-tag-link">
                {task}
              </a>
            ) : (
              <Label key={task} size="large" variant="secondary">
                {task}
              </Label>
            ))}
        </Box>
      )}
    </Box>
  )
}

export function LanguagesSection({languages}: {languages: string[]}) {
  const [languagesIsOpen, setLanguagesIsOpen] = useState(false)
  const shouldTruncateLanguages = languages.length > 12
  let languagesString: string | undefined
  const languageNames = new Intl.DisplayNames(['en'], {type: 'language'})
  const formattedLanguages = languages.map(language => languageNames.of(language))

  if (formattedLanguages.length === 1) {
    languagesString = formattedLanguages[0]
  } else if (shouldTruncateLanguages && !languagesIsOpen) {
    languagesString = formattedLanguages.slice(0, 12).join(', ')
  } else {
    const languagesButLast = formattedLanguages.slice(0, formattedLanguages.length - 1).join(', ')
    languagesString = `${languagesButLast}, and ${formattedLanguages[formattedLanguages.length - 1]}`
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Heading title="Languages" count={languages.length} />
      <div>
        {languagesString}{' '}
        {shouldTruncateLanguages && !languagesIsOpen && (
          <>
            {' '}
            <Box
              as="button"
              aria-label="Reveal all languages"
              sx={{color: 'fg.muted', display: 'inline', cursor: 'pointer', border: 0, bg: 'transparent'}}
              onClick={() => setLanguagesIsOpen(true)}
            >
              <EllipsisIcon />
            </Box>
          </>
        )}
      </div>
    </Box>
  )
}

const Heading = ({title, count}: {title: string; count?: number}) => (
  <Box sx={{display: 'flex', alignItems: 'baseline', gap: 1}}>
    <Text as="h3" sx={{fontWeight: 'bold', fontSize: [1, 1, 2]}}>
      {title}
    </Text>
    {count && <CounterLabel>{count}</CounterLabel>}
  </Box>
)

const tokenLabel = (n: number) => `${Math.round(n / 1000)}k`
const capitalize = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

function InfoItem({isInline = false, children, label}: {isInline: boolean; children: React.ReactNode; label?: string}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        fontSize: 1,
        flex: 1,
        ...(isInline && {
          flexBasis: '140px',
          mr: [2, 2, 0],
        }),
      }}
    >
      {label && <Box sx={{color: 'fg.default', fontSize: 1, fontWeight: 'semibold', mb: 0}}>{label}</Box>}
      <Box sx={{color: 'fg.muted'}}>{children}</Box>
    </Box>
  )
}

export function ModelDetails({direction = 'column', model}: {direction?: 'column' | 'row'; model: Model}) {
  const rateLimitTier = model.rate_limit_tier
  const maxOutputTokens = model.max_output_tokens ? tokenLabel(model.max_output_tokens) : ''
  const maxInputTokens = tokenLabel(model.max_input_tokens)
  const inline = direction === 'row'
  const layout = {
    column: {
      flexDirection: 'column',
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  }[direction]

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        gap: 2,
        ...layout,
      }}
    >
      <InfoItem isInline={inline} label="Context">
        {maxInputTokens} input {maxOutputTokens ? <>&middot; {maxOutputTokens} output</> : ``}
      </InfoItem>

      <InfoItem isInline={inline} label="Training date">
        {model.training_data_date || 'Undisclosed'}
      </InfoItem>

      {rateLimitTier && (
        <InfoItem isInline={inline} label="Rate limit tier">
          <Link inline={true} href="https://docs.github.com/en/github-models/prototyping-with-ai-models#rate-limits">
            {capitalize(rateLimitTier)}
          </Link>
        </InfoItem>
      )}

      <InfoItem isInline={inline} label="Provider support">
        <Link inline={true} href={`https://ai.azure.com/github/support/${model.name}`}>
          Azure support site
        </Link>
      </InfoItem>
    </Box>
  )
}

export default function SidebarInfo({model}: {model: Model}) {
  const {task, summary, tags} = model
  const labels = {tags, task}
  const languages = model.supported_languages.filter(language => language !== null)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Heading title="About" />
        <Text sx={{lineHeight: 1.5}}>{summary}</Text>
      </Box>
      <ModelDetails model={model} />
      {(labels.tags.length > 0 || labels.task) && <TagsSection labels={labels} />}
      {languages.length > 0 && <LanguagesSection languages={languages} />}
    </Box>
  )
}
