import {useRef, useState} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useCSRFToken} from '@github-ui/use-csrf-token'
import {Box, Breadcrumbs, Button, FormControl, Link, Pagehead, Textarea} from '@primer/react'
import {validRange} from 'semver'

export interface ModelPacksPayload {
  orgSecurityAnalysisUrl: string
  formUrl: string
  formMethod: string
  existingModelPacks: string
  defaultSetupUrl: string
  codeqlPackPublishUrl: string
  aboutCodeqlPacksUrl: string
}

export function ModelPacks() {
  const {
    orgSecurityAnalysisUrl,
    formUrl,
    formMethod,
    existingModelPacks,
    defaultSetupUrl,
    codeqlPackPublishUrl,
    aboutCodeqlPacksUrl,
  } = useRoutePayload<ModelPacksPayload>()

  const modelPacksRef = useRef<HTMLTextAreaElement>(null)
  const csrf = useCSRFToken(formUrl, formMethod)
  const [validationError, setValidationError] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (modelPacksRef.current === null) {
      return
    }

    // Validate each line of the input
    const error = validateMultiplePacks(modelPacksRef.current.value)
    if (error !== '') {
      setValidationError(error)
      event.preventDefault()
      return
    }
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pb: 2, ml: 4}}>
      <form action={formUrl} method="post" data-testid="model-packs-form" onSubmit={handleSubmit}>
        {
          // eslint-disable-next-line github/authenticity-token
          <input type="hidden" name="authenticity_token" value={csrf} />
        }
        <input type="hidden" name="_method" value={formMethod} autoComplete="off" />
        <Breadcrumbs>
          <Breadcrumbs.Item href={orgSecurityAnalysisUrl}>Code security and analysis</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#" selected>
            Expand CodeQL analysis
          </Breadcrumbs.Item>
        </Breadcrumbs>
        <Pagehead as="h3" sx={{mb: 3, pb: 1, pt: 3, fontWeight: 'bold', fontSize: 3}}>
          Expand CodeQL analysis
        </Pagehead>
        <div>
          <FormControl>
            <FormControl.Label>Model packs</FormControl.Label>
            <Textarea
              block={true}
              name="code_scanning_org_level_model_packs"
              aria-label="Enter model packs, divided by a new line"
              ref={modelPacksRef}
              placeholder="myorg/mypack@1.2.3"
              defaultValue={existingModelPacks}
              validationStatus={validationError ? 'error' : undefined}
            />
            <FormControl.Caption>
              Add one pack per line, following the{' '}
              <Link href={codeqlPackPublishUrl} inline>
                &lt;scope&gt;/&lt;pack&gt;@x.x.x format
              </Link>
              . CodeQL model packs{' '}
              <Link href={aboutCodeqlPacksUrl} inline>
                expand CodeQL analysis
              </Link>{' '}
              to recognise more libraries and frameworks in repositories using{' '}
              <Link href={defaultSetupUrl} inline>
                CodeQL default setup.
              </Link>
            </FormControl.Caption>
            {validationError && <FormControl.Validation variant="error">{validationError}</FormControl.Validation>}
          </FormControl>
        </div>
        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2}}>
          <Button type="submit" variant="primary" sx={{mr: 2}}>
            Save
          </Button>
          <Button as="a" href={orgSecurityAnalysisUrl}>
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  )
}

// The regexp patterns come from:
// https://github.com/github/semmle-code/blob/main/frontend/src/com/semmle/frontend/packs/PackName.java#L56-L66
// This is why we prefer the string concat version instead of a template. That
// makes it easier to compare the pattern to the Java code.
const identifierPatternString = '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)'
const packNamePattern = new RegExp(
  // eslint-disable-next-line prefer-template
  '^(?:(?<scope>' +
    identifierPatternString +
    ')/)?' + // scope
    '(?<name>' +
    identifierPatternString +
    ')$',
) // name

// validatePack checks whether a pack is valid.
// It returns an empty string if the pack is valid, otherwise it returns the invalid part.
export function validatePack(s: string): string {
  const parts = s.split('@')

  // Note: this is just for safety, s.split should never return the empty array when
  // called with a non-empty string.
  if (parts.length < 1) {
    return 'pack name'
  }
  const name = parts[0]
  // We could trim the strings before checking the pattern, that would allow a pack name
  // with leading/trailing spaces. E.g. '  semmle/codeql@1.2.3  '. But at the moment we
  // do not allow that. So we only trim to check if the name or range is empty.
  if (name !== undefined && (name.trim() === '' || !packNamePattern.test(name))) {
    return 'pack name'
  }

  if (parts.length < 2) {
    return ''
  }
  const range = parts[1]
  if (range !== undefined && (range.trim() === '' || validRange(range) === null)) {
    return 'range'
  }

  return ''
}

// validateMultiplePacks checks whether the string containing multiple packs is valid.
// If returns an empty string if the whole string is valid, otherwise it returns an error
export function validateMultiplePacks(s: string): string {
  // Validate each line of the input
  // We filter out empty lines to allow the user to group their packs with empty lines between them.
  const modelPacks = s.split('\n').filter(line => line !== '')
  for (const pack of modelPacks) {
    const invalidPart = validatePack(pack)
    if (invalidPart !== '') {
      return `Invalid ${invalidPart} for pack: ${pack}`
    }
  }
  return ''
}
