import {announce} from '@github-ui/aria-live'
import {testIdProps} from '@github-ui/test-id-props'
import {CopyIcon, DuplicateIcon, GlobeIcon, LockIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Heading, Link, Text, ToggleSwitch} from '@primer/react'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {apiResyncElasticsearchIndex} from '../../../api/memex-items/api-resync-elasticsearch-index'
import {
  CopyAsTemplate,
  CopyProject,
  CreatedWithTemplateClick,
  ProjectDescriptionSettingsPageUI,
  ProjectReadmeSettingsPageUI,
} from '../../../api/stats/contracts'
import {SuccessState} from '../../../components/common/state-style-decorators'
import {SanitizedHtml} from '../../../components/dom/sanitized-html'
import {getInitialState} from '../../../helpers/initial-state'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useCreatedWithTemplateMemex} from '../../../state-providers/created-with-template-memex/created-with-template-memex-provider'
import {useDeleteMemex} from '../../../state-providers/memex/use-delete-memex'
import {useProjectDetails} from '../../../state-providers/memex/use-project-details'
import {useProjectNumber} from '../../../state-providers/memex/use-project-number'
import {useProjectState} from '../../../state-providers/memex/use-project-state'
import {useToggleMemexClose} from '../../../state-providers/memex/use-toggle-memex-close'
import {useToggleMemexPublic} from '../../../state-providers/memex/use-toggle-memex-public'
import {useUpdateMemexIsTemplate} from '../../../state-providers/memex/use-update-memex-is-template'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'
import {Resources, SettingsResources} from '../../../strings'
import {BetaOptoutSettingsCard} from './beta-optout-settings-card'
import {DeleteProjectDialog} from './delete-project-dialog'
import {ProjectSettingsCard, ProjectSettingsCardBody, ProjectSettingsCardHeader} from './project-settings-card'
import {ProjectSettingsForm} from './project-settings-form'
import {RemoveTemplateDialog} from './remove-template-dialog'

const consistencyColor = ({
  consistency,
  inconsistencyThreshold,
}: {
  consistency?: number
  inconsistencyThreshold?: number
}) => {
  if (!consistency || !inconsistencyThreshold) return 'fg.muted'
  if (consistency < inconsistencyThreshold * 100) return 'danger.fg'
  return 'success.fg'
}

export function GeneralSettingsView() {
  const {isClosed, isPublicProject, isTemplate} = useProjectState()
  const {isOrganization, projectOwner, copyProjectPartialUrl} = getInitialState()
  const {createdWithTemplateMemex} = useCreatedWithTemplateMemex()
  const {hasAdminPermissions, canChangeProjectVisibility, canCopyAsTemplate} = ViewerPrivileges()
  const {projectNumber} = useProjectNumber()
  const {toggleMemexClose} = useToggleMemexClose()
  const {toggleMemexPublic} = useToggleMemexPublic()
  const [visibilityState, setVisibilityState] = useState('')
  const {postStats} = usePostStats()
  const canDeleteProjects = hasAdminPermissions
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false)
  const {updateIsTemplate} = useUpdateMemexIsTemplate()
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isTemplateResponseState, setIsTemplateResponseState] = useState('')
  const {deleteMemex} = useDeleteMemex()
  const {memex_paginated_archive, memex_table_without_limits, memex_resync_index, mwl_beta_optout} =
    useEnabledFeatures()
  const canResyncIndex =
    (memex_paginated_archive || memex_table_without_limits) && memex_resync_index && hasAdminPermissions
  const canOptoutFromBeta = hasAdminPermissions && mwl_beta_optout && memex_table_without_limits
  const canMakeTemplate = hasAdminPermissions
  const showTemplatesSection = isOrganization && (canCopyAsTemplate || canMakeTemplate || createdWithTemplateMemex)

  const handleDeleteMemex = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      deleteMemex()
    },
    [deleteMemex],
  )

  const onMemexClose = useCallback(
    async (close: boolean) => {
      await toggleMemexClose(close)
    },
    [toggleMemexClose],
  )

  const onMemexPublic = useCallback(
    async (setPublic: boolean) => {
      try {
        if (isPublicProject !== setPublic) {
          await toggleMemexPublic(setPublic)
          setVisibilityState('success')
        }
      } catch {
        setVisibilityState('error')
      }
    },
    [toggleMemexPublic, isPublicProject],
  )

  const resetNetworkCall = useCallback(() => {
    if (visibilityState) {
      setVisibilityState('')
    }
  }, [visibilityState, setVisibilityState])

  const {title, consistency, inconsistencyThreshold} = useProjectDetails()
  const memexItems = useMemexItems().items
  const canSeeConsistencyMetric = hasAdminPermissions && memex_resync_index && !!inconsistencyThreshold

  const draftIssueCount = useMemo(
    () => memexItems.filter(item => item.contentType === 'DraftIssue').length,
    [memexItems],
  )

  const postMakeCopyStats = useCallback(() => {
    postStats({
      name: CopyProject,
      ui: ProjectReadmeSettingsPageUI,
    })
  }, [postStats])

  const postCopyAsTemplateStats = useCallback(() => {
    postStats({
      name: CopyAsTemplate,
      ui: ProjectReadmeSettingsPageUI,
    })
  }, [postStats])

  const onClickLinkedTemplateMemex = useCallback(() => {
    postStats({
      name: CreatedWithTemplateClick,
      ui: ProjectDescriptionSettingsPageUI,
      context: JSON.stringify({
        templateMemexId: createdWithTemplateMemex?.id,
      }),
    })
  }, [postStats, createdWithTemplateMemex])

  const projectVisibilityDescription = useMemo(() => {
    if (canChangeProjectVisibility && isPublicProject) {
      return projectOwner?.isEnterpriseManaged ? SettingsResources.projectIsInternal : SettingsResources.projectIsPublic
    }

    if (canChangeProjectVisibility) {
      return SettingsResources.projectIsPrivate
    }

    if (isOrganization) {
      return SettingsResources.organizationOwnedProjectVisibilityRestriction
    }

    return SettingsResources.userOwnedProjectVisibilityRestriction
  }, [canChangeProjectVisibility, isPublicProject, isOrganization, projectOwner?.isEnterpriseManaged])

  const projectVisibilityButtonLabel = isPublicProject
    ? projectOwner?.isEnterpriseManaged
      ? 'Internal'
      : 'Public'
    : 'Private'

  const handleTemplateSwitch = (props: string) => {
    if (props === 'confirm') {
      toggleIsTemplate(!isTemplate)
    }
    setIsTemplateDialogOpen(false)
  }

  const toggleIsTemplate = useCallback(
    async (setIsTemplate: boolean) => {
      try {
        if (isTemplate !== setIsTemplate) {
          await updateIsTemplate(setIsTemplate)
          setIsTemplateResponseState('success')
          setTimeout(() => {
            setIsTemplateResponseState('')
          }, 1800)
        }
      } catch {
        setIsTemplateResponseState('error')
      }
    },
    [updateIsTemplate, isTemplate],
  )

  useEffect(() => {
    if (isTemplateResponseState === 'success') {
      announce(Resources.changesSaved)
    }
  }, [isTemplateResponseState, isTemplate])

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}} {...testIdProps('general-settings')}>
      <ProjectSettingsForm />
      {showTemplatesSection && (
        <>
          <Heading
            as="h2"
            sx={{
              borderBottomColor: 'border.muted',
              borderBottomStyle: 'solid',
              borderBottomWidth: '1px',
              fontSize: 4,
              fontWeight: 'normal',
              pb: 2,
              mb: 2,
            }}
          >
            Templates
          </Heading>
          {createdWithTemplateMemex && (
            <Box sx={{flex: 'auto'}}>
              <Text {...testIdProps('created-with-template-link')} as="p" sx={{fontSize: 1, mt: 1}}>
                This project was created with the&nbsp;
                <Link inline target="_blank" href={createdWithTemplateMemex.url} onClick={onClickLinkedTemplateMemex}>
                  <SanitizedHtml>{createdWithTemplateMemex.titleHtml}</SanitizedHtml>
                </Link>
                &nbsp;template.
              </Text>
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              borderColor: 'border.default',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderRadius: 2,
              mb: 4,
            }}
          >
            {canMakeTemplate && (
              <ProjectSettingsCard showDivider={canCopyAsTemplate}>
                <Box sx={{flex: 'auto'}}>
                  <Box sx={{fontWeight: 'bold', mb: 1}} id="make-template-label">
                    Make template
                  </Box>
                  <Text as="p" sx={{m: 0}} id="make-template-description">
                    Make this project a template that can be used by members of the <b>{projectOwner?.login}</b>{' '}
                    organization when creating new projects.
                  </Text>
                  <div />
                </Box>
                <ProjectSettingsCardBody>
                  <Box
                    sx={{
                      width: '150px',
                      display: 'flex',
                      justifyContent: 'end',
                    }}
                  >
                    {isTemplateResponseState === 'success' && (
                      <>
                        <SuccessState />
                        <Text sx={{ml: 1}}>Saved!</Text>
                      </>
                    )}
                    {isTemplateResponseState === 'error' && <Text sx={{color: 'danger.fg'}}>Something went wrong</Text>}
                  </Box>

                  <ToggleSwitch
                    aria-labelledby="make-template-label"
                    aria-describedby="make-template-description"
                    disabled={isClosed}
                    onClick={() => {
                      if (!isTemplate) {
                        toggleIsTemplate(!isTemplate)
                      }
                      setIsTemplateDialogOpen(isTemplate)
                    }}
                    checked={isTemplate}
                  />
                </ProjectSettingsCardBody>
              </ProjectSettingsCard>
            )}

            {canCopyAsTemplate && (
              <ProjectSettingsCard>
                <Box sx={{flex: 'auto'}}>
                  <Heading as="h3" sx={{mb: 1, fontSize: 1}}>
                    Copy as template
                  </Heading>
                  <span>Copy this project into a template that can be used when creating new projects.</span>
                </Box>
                <ProjectSettingsCardBody>
                  <include-fragment
                    key="settingsCopyAsTemplate"
                    src={encodeURI(`${copyProjectPartialUrl}?copy_as_template=true`)}
                  />
                  <Button
                    key="settingsCopyAsTemplateButton"
                    variant="default"
                    aria-label="Copy as template"
                    id={`settings-copy-as-template-dialog-${projectNumber}`}
                    data-show-dialog-id={`copy-as-template-dialog-${projectNumber}`}
                    sx={{
                      color: 'fg.default',
                      textAlign: 'left',
                      '&& [data-component="buttonContent"]': {
                        flex: 0,
                      },
                    }}
                    leadingVisual={DuplicateIcon}
                    onClick={postCopyAsTemplateStats}
                    {...testIdProps('copy-as-template-button')}
                  >
                    <span>Copy as template</span>
                  </Button>
                </ProjectSettingsCardBody>
              </ProjectSettingsCard>
            )}
          </Box>
        </>
      )}

      {isTemplateDialogOpen && (
        <RemoveTemplateDialog
          isOpen={isTemplateDialogOpen}
          onClose={props => {
            handleTemplateSwitch(props)
          }}
        />
      )}

      {canOptoutFromBeta && <BetaOptoutSettingsCard />}

      <Heading
        as="h2"
        sx={{
          borderBottomColor: 'border.muted',
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          fontSize: 4,
          fontWeight: 'normal',
          pb: 2,
          mb: 2,
        }}
      >
        More options
      </Heading>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          borderColor: 'border.default',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: 2,
          mb: 4,
        }}
      >
        <ProjectSettingsCard>
          <ProjectSettingsCardHeader title="Make a copy" description="Make a copy of this project." />
          <ProjectSettingsCardBody>
            <include-fragment key="settingsCopyProject" src={encodeURI(copyProjectPartialUrl)} />
            <Button
              key="settingsCopyProjectButton"
              variant="default"
              aria-label="Make a copy"
              id={`settings-copy-project-dialog-${projectNumber}`}
              data-show-dialog-id={`copy-project-dialog-${projectNumber}`}
              sx={{
                color: 'fg.default',
                textAlign: 'left',
                '&& [data-component="buttonContent"]': {
                  flex: 0,
                },
              }}
              block
              leadingVisual={CopyIcon}
              onClick={postMakeCopyStats}
            >
              <span>Make a copy</span>
            </Button>
          </ProjectSettingsCardBody>
        </ProjectSettingsCard>
      </Box>

      <Heading as="h3" sx={{fontSize: 4, mb: 2, fontWeight: 'normal'}}>
        Danger zone
      </Heading>
      <Box sx={{borderColor: 'danger.emphasis', borderWidth: '1px', borderStyle: 'solid', borderRadius: 2, mb: 4}}>
        <Box sx={{justifyItems: 'center', display: 'flex', flexDirection: 'column'}}>
          {hasAdminPermissions && (
            <ProjectSettingsCard showDivider>
              <Box sx={{flex: 'auto'}}>
                <Heading as="h3" id="visibilityHeading" sx={{fontSize: 1, mb: 1}}>
                  Visibility
                </Heading>
                <Text sx={{fontSize: 1}} {...testIdProps('project-visibility-text')}>
                  {projectVisibilityDescription}
                </Text>
              </Box>
              <ProjectSettingsCardBody>
                <Box sx={{display: 'flex', flexWrap: 'wrap-reverse', justifyContent: 'flex-end'}}>
                  <Box sx={{pt: 2}}>
                    <div aria-live="polite" {...testIdProps('project-visibility-update-status')}>
                      {visibilityState === 'success' && (
                        <>
                          <SuccessState />
                          <Text sx={{ml: 1}}>Changes saved</Text>
                        </>
                      )}
                      {visibilityState === 'error' && <Text sx={{color: 'danger.fg'}}>Something went wrong</Text>}
                    </div>
                  </Box>
                  <ActionMenu>
                    <ActionMenu.Button
                      {...testIdProps('project-visibility-button')}
                      sx={{position: 'relative', ml: '16px', px: 3}}
                      onClick={resetNetworkCall}
                      aria-describedby="visibilityHeading"
                      leadingVisual={isPublicProject ? GlobeIcon : LockIcon}
                      disabled={!canChangeProjectVisibility}
                    >
                      {projectVisibilityButtonLabel}
                    </ActionMenu.Button>
                    <ActionMenu.Overlay anchorSide="inside-right">
                      <ActionList selectionVariant="single">
                        <ActionList.Item
                          key="private"
                          onSelect={() => onMemexPublic(false)}
                          selected={!isPublicProject}
                          sx={{alignItems: 'flex-start'}}
                        >
                          Private
                          <ActionList.Description variant="block">
                            You choose who can read, write, and admin this project.
                          </ActionList.Description>
                        </ActionList.Item>
                        <ActionList.Item
                          key="public"
                          onSelect={() => onMemexPublic(true)}
                          selected={isPublicProject}
                          sx={{alignItems: 'flex-start'}}
                        >
                          {projectOwner?.isEnterpriseManaged ? 'Internal' : 'Public'}
                          <ActionList.Description variant="block">
                            Everyone {projectOwner?.isEnterpriseManaged ? 'in your enterprise' : 'on the internet'} has
                            read access to this project. You choose who has write and admin access.
                          </ActionList.Description>
                        </ActionList.Item>
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                </Box>
              </ProjectSettingsCardBody>
            </ProjectSettingsCard>
          )}

          <ProjectSettingsCard showDivider={canDeleteProjects}>
            {isClosed ? (
              <>
                <ProjectSettingsCardHeader
                  title="Re-open project"
                  description="Re-opening a project will add it to the list of open projects."
                />
                <ProjectSettingsCardBody>
                  <Button {...testIdProps('reopen-project-button')} onClick={() => onMemexClose(false)}>
                    Re-open this project
                  </Button>
                </ProjectSettingsCardBody>
              </>
            ) : (
              <>
                <ProjectSettingsCardHeader
                  title="Close project"
                  description="Closing a project will disable its workflows & remove it from the list of open projects."
                />
                <ProjectSettingsCardBody>
                  <Button variant="danger" {...testIdProps('close-project-button')} onClick={() => onMemexClose(true)}>
                    Close this project
                  </Button>
                </ProjectSettingsCardBody>
              </>
            )}
          </ProjectSettingsCard>
          {canDeleteProjects && (
            <ProjectSettingsCard showDivider={canResyncIndex}>
              <ProjectSettingsCardHeader
                title="Delete project"
                description="Once you delete a project, there is no going back. Please be certain."
              />
              <ProjectSettingsCardBody>
                <Button
                  variant="danger"
                  {...testIdProps('delete-project-button')}
                  onClick={() => setIsDeleteProjectDialogOpen(true)}
                >
                  Delete this project
                </Button>
              </ProjectSettingsCardBody>
            </ProjectSettingsCard>
          )}
          {canResyncIndex && (
            <ProjectSettingsCard>
              <ProjectSettingsCardHeader
                title="Resync search index for this project"
                description="This will asynchronously correct inconsistencies between the search index and the database"
              >
                {canSeeConsistencyMetric && (
                  <>
                    <Text sx={{fontSize: 1}} {...testIdProps('resync-project-es-index-consistency-text')}>
                      {`The project data consistency with Elasticsearch is ${!consistency ? '' : 'at'} `}
                    </Text>
                    <Text
                      sx={{fontSize: 1, color: consistencyColor({consistency, inconsistencyThreshold})}}
                      {...testIdProps('resync-project-es-index-consistency-value')}
                    >
                      {`${!consistency ? 'unknown' : `${consistency}%`}. `}
                    </Text>
                  </>
                )}
              </ProjectSettingsCardHeader>
              <ProjectSettingsCardBody>
                <Button
                  variant="danger"
                  {...testIdProps('resync-project-es-index-button')}
                  onClick={() => apiResyncElasticsearchIndex()}
                >
                  Resync search index
                </Button>
              </ProjectSettingsCardBody>
            </ProjectSettingsCard>
          )}
        </Box>
      </Box>
      {isDeleteProjectDialogOpen && (
        <DeleteProjectDialog
          onClose={() => setIsDeleteProjectDialogOpen(false)}
          projectName={title}
          onConfirm={handleDeleteMemex}
          draftIssueCount={draftIssueCount}
        />
      )}
    </Box>
  )
}
