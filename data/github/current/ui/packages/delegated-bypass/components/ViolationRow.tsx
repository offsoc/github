// eslint-disable-next-line @github-ui/github-monorepo/restrict-package-deep-imports
import type {RuleRun} from '@github-ui/repos-rules/types/rules-types' // TODO
import {ChevronDownIcon, ChevronUpIcon, StopIcon} from '@primer/octicons-react'
import {Box, Octicon, Text, CounterLabel, IconButton, Link} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useState} from 'react'

export function ViolationRow({
  ruleRun,
  afterOid,
  sx,
}: {
  ruleRun: RuleRun
  afterOid?: string | null
  sx?: BetterSystemStyleObject
}) {
  const [showDetails, setShowDetails] = useState(false)

  const {
    ruleDisplayName,
    violations,
    insightsCategory: {name, viewLink},
  } = ruleRun

  return (
    <Box sx={{...sx, mx: 4, py: 3}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Octicon icon={StopIcon} size={16} sx={{color: 'danger.fg'}} />
          <Text sx={{fontSize: 2, fontWeight: 'bold', ml: 2}}>{ruleDisplayName} </Text>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          {violations && (
            <CounterLabel
              scheme="secondary"
              sx={{height: 20, width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
            >
              {violations.total}
            </CounterLabel>
          )}
          <IconButton
            aria-label="View details"
            variant="invisible"
            icon={showDetails ? ChevronUpIcon : ChevronDownIcon}
            sx={{ml: 2}}
            onClick={() => setShowDetails(!showDetails)}
          />
        </Box>
      </Box>
      {showDetails && (
        <>
          <Box
            as="ul"
            sx={{
              p: 3,
              my: 3,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'mono',
              fontSize: 12,
              backgroundColor: 'canvas.subtle',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              listStyleType: 'none',
              '> li::before': {
                content: "'-'",
                mr: 1,
              },
            }}
            tabIndex={0}
            className="Box"
          >
            {violations?.items.map(violation => (
              <Box as="li" key={violation.candidate} sx={{display: 'flex', gap: 1}}>
                <Box as="ul" sx={{listStyleType: 'none', pr: 3}}>
                  {(violation.commit_oid || afterOid) && (
                    <Box as="li" sx={{display: 'flex', gap: 1}}>
                      <span>commit:</span>
                      <span>{violation.commit_oid || afterOid}</span>
                    </Box>
                  )}
                  <Box as="li" sx={{display: 'flex', gap: 1}}>
                    <span>path:</span>
                    <span>{violation.candidate}</span>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          <span className="note">
            Enforced by:{' '}
            <Link href={viewLink} inline={true}>
              {name}
            </Link>
          </span>
        </>
      )}
    </Box>
  )
}
