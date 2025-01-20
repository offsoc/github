import {useMemo, useState} from 'react'
import {useCSRFToken} from '@github-ui/use-csrf-token'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {CheckIcon} from '@primer/octicons-react'
import {Blankslate} from '@primer/react/drafts'
import {
  Box,
  BranchName,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  Label,
  Heading,
  Text,
  Link,
  RelativeTime,
  ActionList,
  ActionMenu,
} from '@primer/react'

export interface DefaultSetupPayload {
  securityAnalysisUrl: string
  querySuitesDocumentationUrl: string
  taintedDataDocumentationUrl: string
  customBuildDocumentationUrl: string
  codeqlLanguagesDocumentationUrl: string
  defaultBranch: string
  protectedBranchesUrl: string
  formUrl: string
  formMethod: string
  isDefaultSetupEnabled: boolean
  selectableLanguages: string[]
  selectedLanguages: string[]
  selectedQuerySuite: string
  recommendedQuerySuite: string
  querySuiteOptions: Array<{label: string; value: string; description: string}>
  selectedThreatModel: string
  showThreatModelInput: boolean
  hasMacOsRunner: boolean
  nextScheduledRunAt: string | null
  isRepoActive: boolean
}

const HIGH_FAILURE_LANGUAGES = new Set(['c-cpp', 'csharp', 'java-kotlin', 'swift'])

const threatModelOptions: Array<{label: string; value: string; description: string}> = [
  {
    label: 'Remote sources',
    value: 'remote',
    description: 'For applications that do not trust data from remote sources such as the network',
  },
  {
    label: 'Remote and local sources',
    value: 'remote_local',
    description: 'For applications that do not trust data from local sources such as files or CLI commands',
  },
]

export function DefaultSetup() {
  const {
    securityAnalysisUrl,
    querySuitesDocumentationUrl,
    taintedDataDocumentationUrl,
    customBuildDocumentationUrl,
    codeqlLanguagesDocumentationUrl,
    defaultBranch,
    protectedBranchesUrl,
    formUrl,
    formMethod,
    isDefaultSetupEnabled,
    selectableLanguages,
    selectedLanguages: initialLanguages,
    selectedQuerySuite: initialQuerySuite,
    recommendedQuerySuite,
    querySuiteOptions,
    selectedThreatModel: initialThreatModel,
    showThreatModelInput,
    hasMacOsRunner,
    nextScheduledRunAt,
    isRepoActive,
  } = useRoutePayload<DefaultSetupPayload>()

  const csrf = useCSRFToken(formUrl, formMethod)

  const submitButtonText = isDefaultSetupEnabled ? 'Save changes' : 'Enable CodeQL'

  const showScheduleRow = !isDefaultSetupEnabled || isRepoActive

  const highFailureLanguagesPresent = useMemo(
    () => selectableLanguages.some(language => HIGH_FAILURE_LANGUAGES.has(language)),
    [selectableLanguages],
  )
  const swiftPresent = useMemo(() => selectableLanguages.includes('swift'), [selectableLanguages])

  const sortedSelectableLanguages = useMemo(() => {
    const allLanguages = new Set(selectableLanguages.concat(initialLanguages))

    return Array.from(allLanguages).sort()
  }, [selectableLanguages, initialLanguages])

  const [languages, setLanguages] = useState<Set<string>>(() => new Set<string>(initialLanguages))
  const [selectedQuerySuite, setSelectedQuerySuite] = useState(initialQuerySuite)

  const querySuiteOptionElements = []
  for (const suite of querySuiteOptions) {
    const value = suite.value
    const label = suite.label
    const description = suite.description

    let recommendedLabel = <></>
    if (recommendedQuerySuite === value) {
      recommendedLabel = <Label variant="accent">Recommended</Label>
    }

    querySuiteOptionElements.push(
      <ActionList.Item key={value} onSelect={() => setSelectedQuerySuite(value)}>
        {label} {recommendedLabel}
        <ActionList.LeadingVisual>{value === selectedQuerySuite && <CheckIcon />} </ActionList.LeadingVisual>
        <ActionList.Description variant="block">{description}</ActionList.Description>
      </ActionList.Item>,
    )
  }

  const querySuiteActionMenuLabel = querySuiteOptions.find(
    querySuiteOption => querySuiteOption.value === selectedQuerySuite,
  )?.label

  const [selectedThreatModel, setSelectedThreatModel] = useState(initialThreatModel)

  const threatModelOptionElements = []
  for (const suite of threatModelOptions) {
    const value = suite.value
    const label = suite.label
    const description = suite.description

    threatModelOptionElements.push(
      <ActionList.Item key={value} onSelect={() => setSelectedThreatModel(value)}>
        {label}
        <ActionList.LeadingVisual>{value === selectedThreatModel && <CheckIcon />} </ActionList.LeadingVisual>
        <ActionList.Description variant="block">{description}</ActionList.Description>
      </ActionList.Item>,
    )
  }

  const threatModelActionMenuLabel = threatModelOptions.find(
    threatModelOption => threatModelOption.value === selectedThreatModel,
  )?.label

  return (
    <form noValidate action={formUrl} method="post" data-testid="default-setup-form">
      {
        // eslint-disable-next-line github/authenticity-token
        <input type="hidden" name="authenticity_token" value={csrf} />
      }
      <input type="hidden" name="_method" value={formMethod} autoComplete="off" />
      <Box sx={{borderColor: 'border.default', borderBottomWidth: 1, borderBottomStyle: 'solid', pb: 2, mb: 3}}>
        <Heading as="h1" sx={{fontSize: 4, fontWeight: 400, display: 'flex'}}>
          <Link href={securityAnalysisUrl}>Code security and analysis</Link>
          <Text as="span" sx={{ml: 2}}>
            / CodeQL default configuration
          </Text>
        </Heading>
      </Box>

      {selectableLanguages.length === 0 ? (
        <>
          <Heading as="h2" sx={{fontSize: 3, fontWeight: 400}}>
            Languages
          </Heading>
          <div className="border rounded-2 mt-2">
            <Blankslate narrow>
              <Blankslate.Heading>
                <Text sx={{fontSize: 1, display: 'block', textAlign: 'center'}}>
                  No CodeQL supported languages to scan in this repository
                </Text>
              </Blankslate.Heading>
              <Blankslate.Description>
                <Text sx={{color: 'fg.muted', fontSize: 1, display: 'block', textAlign: 'center'}}>
                  CodeQL will automatically perform the first scan when it detects{' '}
                  <Link href={codeqlLanguagesDocumentationUrl} target="_blank" inline={true}>
                    a supported language
                  </Link>{' '}
                  on the default branch.
                </Text>
              </Blankslate.Description>
            </Blankslate>
          </div>
        </>
      ) : (
        <CheckboxGroup id="default-setup--languages">
          <CheckboxGroup.Label sx={{fontSize: 3, fontWeight: 400}}>Languages</CheckboxGroup.Label>
          <CheckboxGroup.Caption sx={{color: 'fg.muted', fontSize: 0, fontWeight: 400}}>
            Select one or more languages detected on the default branch for CodeQL to scan.
          </CheckboxGroup.Caption>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'border.default',
              borderRadius: 2,
              mb: 0,
              p: 3,
            }}
          >
            {sortedSelectableLanguages.map(language => (
              <FormControl
                key={language}
                id={`default-setup--language--${language}`}
                disabled={!hasMacOsRunner && language === 'swift'}
              >
                <Checkbox
                  name="config[languages][]"
                  value={language}
                  checked={languages.has(language)}
                  onChange={e => {
                    const newLanguages = new Set(languages)
                    if (e.target.checked) {
                      newLanguages.add(language)
                    } else {
                      newLanguages.delete(language)
                    }

                    setLanguages(newLanguages)
                  }}
                />
                <FormControl.Label>
                  <span data-testid="language-display-name">
                    {getLanguageDisplayName(language)}
                    {HIGH_FAILURE_LANGUAGES.has(language) && <span> *</span>}
                  </span>
                  {language === 'swift' && (
                    <Label variant="success" sx={{ml: 2}}>
                      Beta
                    </Label>
                  )}
                </FormControl.Label>
              </FormControl>
            ))}
          </Box>
          {highFailureLanguagesPresent && (
            <Text sx={{color: 'fg.muted', fontSize: 0, fontWeight: 400}}>
              * These languages may{' '}
              <Link inline href={customBuildDocumentationUrl} target="_blank">
                require a custom build configuration
              </Link>{' '}
              for a successful setup.
              {swiftPresent && !hasMacOsRunner && (
                <>
                  {' '}
                  Swift requires <code>macOS</code> runners.
                </>
              )}
            </Text>
          )}
        </CheckboxGroup>
      )}

      {/* Query Suite Elements */}
      <Box sx={{mt: 4, mb: 2}}>
        <Heading as="h2" sx={{fontSize: 3, fontWeight: 400}}>
          Scan settings
        </Heading>
        <Text sx={{color: 'fg.muted', fontSize: 0, fontWeight: 400}}>
          Adjust the CodeQL scanning strategy to suit the needs of this application
        </Text>
      </Box>
      <input type="hidden" name="config[query_suite]" value={selectedQuerySuite} />

      <Box
        sx={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'border.default',
          borderRadius: 2,
          pr: 3,
          pl: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 3,
            pb: 3,
          }}
        >
          <div>
            <Text sx={{fontSize: 1, fontWeight: 'bold', display: 'block'}}>Query suite</Text>
            <Text sx={{color: 'fg.muted', fontSize: 0, fontWeight: 400}}>
              Select the{' '}
              <Link href={querySuitesDocumentationUrl} target="_blank" inline={true}>
                group of CodeQL queries
              </Link>{' '}
              to run against your code
            </Text>
          </div>
          <ActionMenu>
            <ActionMenu.Button data-testid="querySuiteActionMenuLabel">{querySuiteActionMenuLabel}</ActionMenu.Button>
            <ActionMenu.Overlay width="medium">
              <ActionList showDividers>{querySuiteOptionElements}</ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>

        {showThreatModelInput && (
          <>
            <input type="hidden" name="config[threat_model]" value={selectedThreatModel} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopWidth: 1,
                borderTopStyle: 'solid',
                borderColor: 'border.default',
                pt: 3,
                pb: 3,
              }}
            >
              <div>
                <Text sx={{fontSize: 1, fontWeight: 'bold', display: 'block'}}>Threat model</Text>
                <Text sx={{color: 'fg.muted', fontSize: 0, fontWeight: 400, display: 'block'}}>
                  Select the sources of{' '}
                  <Link inline href={taintedDataDocumentationUrl} target="_blank">
                    tainted data
                  </Link>{' '}
                  that may pose a risk to this application.
                </Text>
                <Text sx={{color: 'fg.muted', fontSize: 0, fontWeight: 400}}>
                  This setting only applies to Java / Kotlin and C# analysis.
                </Text>
              </div>
              <ActionMenu>
                <ActionMenu.Button data-testid="threatModelActionModelLabel">
                  {threatModelActionMenuLabel}
                </ActionMenu.Button>
                <ActionMenu.Overlay width="medium">
                  <ActionList showDividers>{threatModelOptionElements}</ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </Box>
          </>
        )}
      </Box>

      <Box sx={{mt: 4, mb: 2}}>
        <Heading as="h2" sx={{fontSize: 3, fontWeight: 400}}>
          Scan events
        </Heading>
        <Text sx={{color: 'fg.muted', fontSize: 0, fontWeight: 400}}>These events will trigger a new scan.</Text>
      </Box>

      <Box
        sx={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'border.default',
          borderRadius: 2,
          pr: 3,
          pl: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            pt: 3,
            pb: 3,
          }}
        >
          <Text sx={{fontSize: 1, fontWeight: 'bold', mr: 'auto'}}>On push and pull requests to</Text>
          <Text sx={{fontSize: 0, color: 'fg.subtle'}}>
            <BranchName as="span">{defaultBranch}</BranchName> and{' '}
            <Link inline href={protectedBranchesUrl}>
              protected branches
            </Link>
          </Text>
        </Box>
        {showScheduleRow && (
          <Box
            sx={{
              display: 'flex',
              borderTopWidth: 1,
              borderTopStyle: 'solid',
              borderColor: 'border.default',
              pt: 3,
              pb: 3,
            }}
          >
            <Text sx={{fontSize: 1, fontWeight: 'bold', mr: 'auto'}}>On a weekly schedule</Text>
            {nextScheduledRunAt != null && (
              <Text sx={{fontSize: 0, color: 'fg.subtle'}}>
                Next scan of <BranchName as="span">{defaultBranch}</BranchName>{' '}
                <RelativeTime datetime={nextScheduledRunAt} threshold="PT0S" hour="numeric" minute="numeric" />
              </Text>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 5}}>
        <Button type="submit" variant="primary" sx={{mr: 2}}>
          {submitButtonText}
        </Button>
        <Button as="a" href={securityAnalysisUrl}>
          Cancel
        </Button>
      </Box>
    </form>
  )
}

function getLanguageDisplayName(language: string): string {
  switch (language) {
    case 'c-cpp':
    case 'cpp':
      return 'C / C++'
    case 'csharp':
      return 'C#'
    case 'java':
    case 'java-kotlin':
      return 'Java / Kotlin'
    case 'javascript':
    case 'javascript-typescript':
      return 'JavaScript / TypeScript'
    default:
      return language.charAt(0).toUpperCase() + language.slice(1)
  }
}
