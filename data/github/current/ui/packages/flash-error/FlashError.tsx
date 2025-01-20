import {XCircleFillIcon} from '@primer/octicons-react'
import {Box, Flash, Link, Octicon} from '@primer/react'
import {SafeHTMLText} from '@github-ui/safe-html'

export function FlashError({
  prefix,
  errorMessageUsingPrefix,
  errorMessageNotUsingPrefix,
  ruleErrors,
  helpUrl,
  flashRef,
}: {
  prefix: string
  errorMessageUsingPrefix?: string
  errorMessageNotUsingPrefix?: string
  ruleErrors?: string[]
  helpUrl: string
  flashRef?: React.RefObject<HTMLDivElement>
}) {
  const isRuleViolation = (ruleErrors?.length || 0) > 0

  return errorMessageUsingPrefix || errorMessageNotUsingPrefix ? (
    <>
      <Flash
        id="flash"
        variant="danger"
        className="d-flex flex-items-center flex-justify-between"
        sx={{marginBottom: 3}}
        tabIndex={-1}
        ref={flashRef}
      >
        {errorMessageUsingPrefix ? (
          <div>
            {prefix} <SafeHTMLText sx={{fontWeight: 'bold'}} unverifiedHTML={errorMessageUsingPrefix} />
            {isRuleViolation && (
              <Link
                href={`${helpUrl}/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`}
                sx={{marginLeft: 1}}
              >
                Learn more about rulesets.
              </Link>
            )}
          </div>
        ) : (
          errorMessageNotUsingPrefix && <div>{errorMessageNotUsingPrefix}</div>
        )}
      </Flash>
      {isRuleViolation && (
        <Box sx={{marginBottom: 3}}>
          <Box sx={{fontWeight: 'bold', marginBottom: 1}}>Repository rule violations found:</Box>
          {ruleErrors?.map(rule => (
            <Box key={rule} sx={{display: 'flex', alignItems: 'center'}}>
              <Octicon icon={XCircleFillIcon} size={16} sx={{color: 'danger.fg'}} />
              <Box sx={{marginLeft: 2}}>{rule}</Box>
            </Box>
          ))}
        </Box>
      )}
    </>
  ) : null
}
