import {Fragment, useState} from 'react'
import {Box, Button, FormControl} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {RefSelector} from '@github-ui/ref-selector'
import {verifiedFetch} from '@github-ui/verified-fetch'
import type {Repo} from './types'
import {FlashError} from '@github-ui/flash-error'
import {NewBranchName} from './components/NewBranchName'
import {ForkPicker} from './components/ForkPicker'
import {LiveBranches} from './components/LiveBranches'

export interface CreateBranchButtonProps {
  branchListCacheKey: string
  repository: Repo
  repositoryParent?: Repo
  createUrl: string
  helpUrl: string
  liveReload?: boolean
}

export function CreateBranchButton({
  branchListCacheKey,
  repository,
  repositoryParent,
  createUrl,
  helpUrl,
  liveReload,
}: CreateBranchButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [currentDefaultBranch, setCurrentDefaultBranch] = useState(repository.defaultBranch)
  const [branchSource, setBranchSource] = useState(repository.defaultBranch)
  const [newBranchName, setNewBranchName] = useState('')
  const [repoSource, setRepoSource] = useState<Repo>(repository)
  const [isForkSourceOpen, setForkSourceOpen] = useState(false)
  const [ruleErrors, setRuleErrors] = useState<string[] | undefined>(undefined)
  const [otherErrorMessage, setOtherErrorMessage] = useState<string | undefined>(undefined)
  const [isNext, setNext] = useState(false)
  const [isCreating, setCreating] = useState(false)
  const [channel, setChannel] = useState<string | undefined>(undefined)

  function resetData() {
    setRuleErrors(undefined)
    setOtherErrorMessage(undefined)
    setNewBranchName('')
    setNext(false)
  }

  async function createBranch() {
    if (!isCreating) {
      setCreating(true)
      const body = new FormData()

      body.append('name', newBranchName)
      body.append('branch', branchSource)
      if (repositoryParent) {
        body.append('repo', repoSource.id.toString())
      }
      body.append('send_response_as_json', 'true')

      const response = await verifiedFetch(createUrl, {
        method: 'post',
        body,
        headers: {
          Accept: 'application/json',
        },
      })
      const json = await response.json()

      if (response.ok) {
        resetData()
        setShowModal(false)
        liveReload && json.channel ? setChannel(json.channel) : window.location.reload()
      } else {
        const errorMessage: string = json.error
        if (errorMessage?.includes('Repository rule violations found')) {
          setOtherErrorMessage(undefined)
          setRuleErrors(errorMessage.replace('Repository rule violations found', '').trim().split('\n\n').slice(0, 3))
        } else if (errorMessage) {
          setRuleErrors(undefined)
          setOtherErrorMessage(errorMessage.trim())
        }
      }
      setCreating(false)
    }
  }

  return (
    <>
      <Button
        variant="primary"
        sx={{marginLeft: 3}}
        onClick={() => {
          resetData()
          setShowModal(true)
        }}
      >
        New branch
      </Button>
      {showModal && (
        <Dialog
          title="Create a branch"
          width="large"
          onClose={() => {
            setShowModal(false)
            resetData()
          }}
          footerButtons={
            isNext
              ? []
              : [
                  {
                    content: 'Cancel',
                    buttonType: 'normal',
                    onClick: () => {
                      setShowModal(false)
                      resetData()
                    },
                  },
                  {content: 'Create new branch', buttonType: 'primary', onClick: createBranch},
                ]
          }
        >
          <Fragment>
            {(ruleErrors || otherErrorMessage) && (
              <FlashError
                prefix="Unable to create branch:"
                errorMessageUsingPrefix={ruleErrors ? 'Please address the rule violations and try again.' : undefined}
                errorMessageNotUsingPrefix={otherErrorMessage}
                ruleErrors={ruleErrors}
                helpUrl={helpUrl}
              />
            )}
            <NewBranchName newBranchName={newBranchName} setNewBranchName={setNewBranchName} />
            <Box sx={{marginTop: 3}}>
              <FormControl>
                <FormControl.Label sx={{marginBottom: 0}}>Source</FormControl.Label>
                {repositoryParent && (
                  <ForkPicker
                    isForkSourceOpen={isForkSourceOpen}
                    setForkSourceOpen={setForkSourceOpen}
                    repoSource={repoSource}
                    setRepoSource={setRepoSource}
                    repository={repository}
                    repositoryParent={repositoryParent}
                    setDefaultBranch={setCurrentDefaultBranch}
                    setBranchSource={setBranchSource}
                  />
                )}
                <RefSelector
                  currentCommitish={branchSource}
                  defaultBranch={currentDefaultBranch}
                  owner={repoSource.ownerLogin}
                  repo={repoSource.name}
                  canCreate={false}
                  cacheKey={branchListCacheKey}
                  selectedRefType={'branch'}
                  onSelectItem={newRef => setBranchSource(newRef)}
                  closeOnSelect={true}
                  types={['branch']}
                  hideShowAll
                />
              </FormControl>
            </Box>
          </Fragment>
        </Dialog>
      )}
      {channel ? <LiveBranches channel={channel} onUpdate={() => setChannel(undefined)} /> : null}
    </>
  )
}
