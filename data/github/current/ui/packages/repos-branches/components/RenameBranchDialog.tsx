import {Dialog} from '@primer/react/experimental'
import {renameRefPath} from '@github-ui/paths'
import {
  Box,
  BranchName,
  Details,
  Flash,
  FormControl,
  Link,
  Octicon,
  Spinner,
  Text,
  TextInput,
  useDetails,
} from '@primer/react'
import {useEffect, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {useNavigate} from '@github-ui/use-navigate'
import type {Branch} from '../types'
import {AlertIcon, CheckIcon, InfoIcon, TriangleDownIcon, TriangleUpIcon, XIcon} from '@primer/octicons-react'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import type {Repository} from '@github-ui/current-repository'
import {type CheckResult, useRenameRefCheck} from '../hooks/use-rename-ref-check'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import useRenameBranchEffects from '../hooks/use-rename-branch-effects'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

interface RenameBranchDialogProps {
  repo: Repository
  branch: Pick<Branch, 'name' | 'isDefault' | 'rulesetsPath' | 'path'>
  onDismiss(): void
}

export function RenameBranchDialog({repo, branch, onDismiss}: RenameBranchDialogProps): JSX.Element {
  const renameBranchEffects = useRenameBranchEffects({repo, branchName: branch.name})
  const [anyAutomaticChange, setAnyAutomaticChanges] = useState(false)
  const [isRenaming, setRenaming] = useState(false)
  const [isBlank, setIsBlank] = useState(false)
  const [validate, setValidate] = useState(false)
  const [renameErrors, setRenameErrors] = useState<string | null>(null)
  const [newBranchName, setNewBranchName] = useState(branch.name)
  const [normalizedName, setNormalizedName] = useState(branch.name)
  const {getDetailsProps: getUpdateLocalEnvDetailsProps, open: openUpdateLocalEnvLearnMore} = useDetails({
    closeOnOutsideClick: false,
  })
  const {getDetailsProps: getPagesDetailsProps, open: openPagesLearnMore} = useDetails({closeOnOutsideClick: false})
  const navigate = useNavigate()
  const {pathname} = useLocation()
  const {addToast} = useToastContext()

  const [result, runCheck] = useRenameRefCheck({repo, currentRefName: branch.name})
  const content = `
  git branch -m ${branch.name} ${normalizedName}
  git fetch origin
  git branch -u origin/${normalizedName} ${normalizedName}
  git remote set-head origin -a
  `

  function resetData() {
    setNewBranchName('')
    setRenameErrors(null)
    setIsBlank(false)
    setValidate(false)
    onDismiss()
  }

  function handleChange(name: string) {
    setValidate(true)
    !name.trim() ? setIsBlank(true) : setIsBlank(false)
    setNewBranchName(name)
  }

  async function renameBranch() {
    if (!isBlank && !isRenaming) {
      setRenaming(true)
      const body = {
        new_name: newBranchName,
      }

      const response = await verifiedFetchJSON(
        renameRefPath({owner: repo.ownerLogin, repo: repo.name, refName: branch.name}),
        {
          method: 'put',
          body,
        },
      )
      const json = await response.json()

      if (response.ok) {
        resetData()
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: json.message,
        })
        navigate(pathname)
      } else {
        const errorMessage: string = json.error
        if (errorMessage) {
          setRenameErrors(errorMessage)
        }
      }
      setRenaming(false)
    }
  }

  // Validate branch name
  useEffect(() => {
    if (validate) {
      runCheck(newBranchName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only re-check when branch name changes and validation is true
  }, [validate, newBranchName])

  // Set validation message
  useEffect(() => {
    if (!validate) {
      return
    }
    if (isBlank) {
      setNormalizedName(branch.name)
      return
    }
    if (result.message && result.normalizedName) {
      setNormalizedName(result.normalizedName)
    }
  }, [isBlank, branch.name, result.message, result.normalizedName, validate])

  // Set rename effects
  useEffect(() => {
    if (renameBranchEffects) {
      const {prRetargetCount, prClosureCount, draftReleaseCount, protectedBranchCount, willPagesChange} =
        renameBranchEffects
      setAnyAutomaticChanges(
        prRetargetCount > 0 ||
          prClosureCount > 0 ||
          draftReleaseCount > 0 ||
          protectedBranchCount > 0 ||
          !!willPagesChange,
      )
    }
  }, [renameBranchEffects])

  return (
    <Dialog
      title={`Rename ${branch.isDefault ? 'default ' : ''}branch`}
      width="large"
      onClose={resetData}
      footerButtons={[
        {
          content: 'Cancel',
          buttonType: 'normal',
          onClick: resetData,
        },
        {content: 'Rename branch', buttonType: 'primary', onClick: renameBranch},
      ]}
    >
      <Box sx={{overflow: 'hidden'}}>
        {renameErrors ? (
          <Flash variant="danger" sx={{mb: 3}}>
            <span>{renameErrors}</span>
          </Flash>
        ) : null}
        <FormControl sx={{mb: 3}}>
          <FormControl.Label>
            Rename <BranchName href={branch.path}>{branch.name}</BranchName> to:
          </FormControl.Label>
          <TextInput
            block
            aria-label="New branch name"
            className="color-bg-subtle"
            value={newBranchName}
            placeholder={branch.name}
            onChange={e => handleChange(e.target.value)}
          />
          {branch.isDefault && (
            <FormControl.Caption>
              Most projects name the default branch <Text sx={{fontWeight: 'bold'}}>main</Text>
            </FormControl.Caption>
          )}
          <BranchRenameValidation validate={validate} isBlank={isBlank} result={result} />
        </FormControl>
        {!renameBranchEffects ? (
          <>
            <LoadingSkeleton sx={{width: '30%', mb: 2}} variant="rounded" height="md" />
            <LoadingSkeleton sx={{width: '60%', mb: 2}} variant="rounded" height="md" />
            <LoadingSkeleton sx={{width: '80%', mb: 2}} variant="rounded" height="md" />
            <LoadingSkeleton sx={{width: '70%', mb: 2}} variant="rounded" height="md" />
          </>
        ) : (
          <>
            {anyAutomaticChange ? (
              <div>
                <Box sx={{mb: 2}}>
                  <span>Renaming this branch:</span>
                </Box>
                <ul style={{display: 'flex', flexDirection: 'column', margin: 0, listStyle: 'none', gap: 2}}>
                  {renameBranchEffects.prRetargetCount > 0 && (
                    <li style={{display: 'flex', alignItems: 'flex-start', gap: 3}} data-testid="update-pr">
                      <div>
                        <Octicon icon={CheckIcon} sx={{color: 'success.fg'}} />
                      </div>
                      <div>
                        Will update <Text sx={{fontWeight: 'bold'}}>{renameBranchEffects.prRetargetCount}</Text> pull{' '}
                        {pluralize({word: 'request', count: renameBranchEffects.prRetargetCount})} targeting this{' '}
                        {renameBranchEffects.prRetargetRepoCount > 1 ? (
                          <span>
                            branch across{' '}
                            <Text sx={{fontWeight: 'bold'}}>{renameBranchEffects.prRetargetRepoCount}</Text>{' '}
                            repositories.
                          </span>
                        ) : (
                          <span>branch.</span>
                        )}
                      </div>
                    </li>
                  )}
                  {renameBranchEffects.prClosureCount > 0 && (
                    <li style={{display: 'flex', alignItems: 'flex-start', gap: 3}} data-testid="close-pr">
                      <div>
                        <Octicon icon={CheckIcon} sx={{color: 'success.fg'}} />
                      </div>
                      <div>
                        Will close <Text sx={{fontWeight: 'bold'}}>{renameBranchEffects.prClosureCount}</Text> open pull{' '}
                        {pluralize({word: 'request', count: renameBranchEffects.prClosureCount})} for this branch.
                      </div>
                    </li>
                  )}
                  {renameBranchEffects.draftReleaseCount > 0 && (
                    <li style={{display: 'flex', alignItems: 'flex-start', gap: 3}} data-testid="rename-draft">
                      <div>
                        <Octicon icon={CheckIcon} sx={{color: 'success.fg'}} />
                      </div>
                      <div>
                        Will update<Text sx={{fontWeight: 'bold'}}> {renameBranchEffects.draftReleaseCount} </Text>
                        draft{' '}
                        {pluralize({
                          word: 'release',
                          count: renameBranchEffects.draftReleaseCount,
                        })}{' '}
                        targeting this branch.
                      </div>
                    </li>
                  )}
                  {renameBranchEffects.protectedBranchCount > 0 && (
                    <li style={{display: 'flex', alignItems: 'flex-start', gap: 3}} data-testid="update-pb">
                      <div>
                        <Octicon icon={CheckIcon} sx={{color: 'success.fg'}} />
                      </div>
                      <div>
                        Will update <Text sx={{fontWeight: 'bold'}}>{renameBranchEffects.protectedBranchCount}</Text>{' '}
                        branch {pluralize({word: 'protection', count: renameBranchEffects.protectedBranchCount})} that{' '}
                        explicitly{' '}
                        {pluralize({word: 'target', count: renameBranchEffects.protectedBranchCount, verb: true})}{' '}
                        <BranchName href={branch.path}>{branch.name}</BranchName>.
                      </div>
                    </li>
                  )}
                  {!!renameBranchEffects.willPagesChange && (
                    <li
                      style={{display: 'flex', alignItems: 'flex-start', gap: 3, minWidth: 0}}
                      data-testid="update-page"
                    >
                      <div>
                        <Octicon icon={AlertIcon} sx={{color: 'danger.fg'}} />
                      </div>
                      <Box sx={{minWidth: 0}}>
                        <span>Will unpublish current GitHub Pages site.</span>
                        <Details {...getPagesDetailsProps()}>
                          {/* eslint-disable-next-line github/a11y-no-title-attribute */}
                          <summary
                            title={`${openPagesLearnMore ? 'Hide' : 'Show'} details on unpublishing GitHub Pages site`}
                          >
                            <Link sx={{display: 'flex', alignItems: 'center'}}>
                              Learn more
                              <Octicon icon={openPagesLearnMore ? TriangleUpIcon : TriangleDownIcon} />
                            </Link>
                          </summary>
                          {openPagesLearnMore && (
                            <Flash variant="default" sx={{mt: 2}}>
                              <Box sx={{display: 'flex'}}>
                                <Octicon icon={InfoIcon} sx={{mt: 1}} />
                                <Text sx={{fontSize: 0}}>
                                  Your current GitHub Pages site will become unpublished. A new commit on the renamed{' '}
                                  branch will publish the GitHub Pages site again.
                                </Text>
                              </Box>
                            </Flash>
                          )}
                        </Details>
                      </Box>
                    </li>
                  )}
                  <li
                    style={{display: 'flex', alignItems: 'flex-start', gap: 3, minWidth: 0}}
                    data-testid="copy-details"
                  >
                    <div>
                      <Octicon icon={XIcon} sx={{color: 'danger.fg'}} />
                    </div>
                    <Box sx={{minWidth: 0}}>
                      <Text sx={{verticalAlign: 'top'}}>Will not update your members&apos; local environments.</Text>
                      <UpdateLocalEnvDetails
                        getUpdateLocalEnvDetailsProps={getUpdateLocalEnvDetailsProps}
                        openUpdateLocalEnvLearnMore={openUpdateLocalEnvLearnMore}
                        content={content}
                      />
                    </Box>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <span>Renaming this branch will not update your members&apos; local environments.</span>
                <UpdateLocalEnvDetails
                  getUpdateLocalEnvDetailsProps={getUpdateLocalEnvDetailsProps}
                  openUpdateLocalEnvLearnMore={openUpdateLocalEnvLearnMore}
                  content={content}
                />
              </>
            )}
          </>
        )}
      </Box>
    </Dialog>
  )
}

function BranchRenameValidation({
  validate,
  isBlank,
  result,
}: {
  validate: boolean
  isBlank: boolean
  result: CheckResult
}): JSX.Element | null {
  if (!validate) {
    return null
  }
  if (isBlank) {
    return <FormControl.Validation variant="error">Name cannot be blank</FormControl.Validation>
  }
  if (!result.status) {
    return (
      <Box sx={{display: 'flex', alignItems: 'center', fontSize: 0}}>
        <Spinner size="small" aria-label="Checking if ref name is valid" sx={{mr: 1}} />
        <Text sx={{color: 'fg.subtle'}}>Checking if branch name is valid</Text>
      </Box>
    )
  }

  if (result.message) {
    return (
      <FormControl.Validation variant={result.status === 'valid' ? 'success' : 'error'}>
        {result.message}
      </FormControl.Validation>
    )
  }
  return null
}

function pluralize({word, count, verb = false}: {word: string; count: number; verb?: boolean}) {
  if (verb) {
    // Add 's' when only 1
    return `${word}${count === 1 ? 's' : ''}`
  }
  return `${word}${count === 1 ? '' : 's'}`
}

function UpdateLocalEnvDetails({
  getUpdateLocalEnvDetailsProps,
  openUpdateLocalEnvLearnMore,
  content,
}: {
  getUpdateLocalEnvDetailsProps: () => {
    onToggle: (e: React.SyntheticEvent<HTMLElement, Event>) => void
    open: boolean | undefined
    ref: React.RefObject<HTMLDetailsElement>
  }
  openUpdateLocalEnvLearnMore: boolean | undefined
  content: string
}): JSX.Element {
  return (
    <Details {...getUpdateLocalEnvDetailsProps()}>
      {/* eslint-disable-next-line github/a11y-no-title-attribute */}
      <summary title={`${openUpdateLocalEnvLearnMore ? 'Hide' : 'Show'} details on updating local environment`}>
        <Link sx={{display: 'flex', alignItems: 'center'}}>
          Learn more
          <Octicon icon={openUpdateLocalEnvLearnMore ? TriangleUpIcon : TriangleDownIcon} />
        </Link>
      </summary>
      {openUpdateLocalEnvLearnMore && (
        <Flash variant="default" sx={{mt: 2}}>
          <Box sx={{display: 'flex'}}>
            <Octicon icon={InfoIcon} sx={{mt: 1}} />
            <Box sx={{overflowX: 'hidden'}}>
              <Text sx={{fontSize: 0}}>
                Your members will have to manually update their local environments. We&apos;ll let them know when they
                visit the repository, or you can share the following commands.
              </Text>
              <Box
                sx={{
                  backgroundColor: 'canvas.subtle',
                  marginTop: 3,
                  position: 'relative',
                  padding: 2,
                  borderRadius: 2,
                }}
              >
                <Box sx={{overflowX: 'auto'}} tabIndex={0}>
                  <Text as="pre" sx={{fontFamily: 'mono', fontSize: 0}}>
                    {content}
                  </Text>
                </Box>
                <Box sx={{position: 'absolute', top: 1, right: 1}}>
                  <CopyToClipboardButton
                    sx={{
                      '.octicon-copy': {m: 0, color: 'fg.subtle'},
                      '.octicon-check': {m: 0, color: 'success.fg'},
                    }}
                    textToCopy={content}
                    ariaLabel={'Copy to clipboard'}
                    tooltipProps={{direction: 'w'}}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Flash>
      )}
    </Details>
  )
}

export default RenameBranchDialog
