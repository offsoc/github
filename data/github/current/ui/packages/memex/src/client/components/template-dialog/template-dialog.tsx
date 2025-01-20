import {announce} from '@github-ui/aria-live'
import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {noop} from '@github-ui/noop'
import {
  ArrowLeftIcon,
  GraphIcon,
  ProjectTemplateIcon,
  SearchIcon,
  WorkflowIcon,
  XCircleFillIcon,
} from '@primer/octicons-react'
import {Box, Button, CounterLabel, FormControl, Heading, NavList, Octicon, TextInput, useTheme} from '@primer/react'
import {Blankslate, Dialog} from '@primer/react/drafts'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {formatDistanceToNow} from 'date-fns'
import debounce from 'lodash-es/debounce'
import {useCallback, useEffect, useMemo, useState} from 'react'

import type {CustomTemplate} from '../../api/common-contracts'
import type {GetCustomTemplatesResponse, SystemTemplate} from '../../api/memex/contracts'
import {TemplatesCancel, TemplatesCreate} from '../../api/stats/contracts'
import {useApplyTemplate} from '../../features/templates/hooks/use-apply-template'
import {getInitialState} from '../../helpers/initial-state'
import {useThemedMediaUrl} from '../../helpers/media-urls'
import {getViewIcons, ViewType} from '../../helpers/view-type'
import {useEmojiAutocomplete} from '../../hooks/common/use-emoji-autocomplete'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useOrganizationTemplates} from '../../queries/org-templates'
import {Link, useSearchParams} from '../../router'
import {useProjectDetails} from '../../state-providers/memex/use-project-details'
import {useTemplateDialog} from '../../state-providers/template-dialog/use-template-dialog'
import {getColumnIcon} from '../column-detail-helpers'
import {FeaturedTemplateCard} from './featured-template-card'
import {
  CustomTemplateParam,
  LayoutTemplateParam,
  type SelectedTemplate,
  SystemTemplateParam,
  useTemplateLink,
} from './hooks/use-template-link'
import {infoContentMap} from './main-content-data'
import {TemplateList} from './template-list'

/** Number of organization templates to preview in the "all templates" tab */
const numberOfTemplatesToPreview = 6

/** Number of system/featured templates to preview in the "all templates tab" */
const numberOfSystemTemplatesToPreview = 2

export const TemplateDialogTabParam = 'template_dialog_tab'
export const TemplateDialogTab = {ALL: 'all', FEATURED: 'featured', ORG: 'organization'} as const
export type TemplateDialogTab =
  | typeof TemplateDialogTab.ALL
  | typeof TemplateDialogTab.FEATURED
  | typeof TemplateDialogTab.ORG

function useCurrentTab(): TemplateDialogTab {
  const {isOrganization} = getInitialState()
  const currentTabSearchParam = useSearchParams()[0].get(TemplateDialogTabParam) ?? TemplateDialogTab.ALL
  if (!isOrganization) {
    // For user projects, the only applicable options is the featured system templates, as there are no org templates
    return TemplateDialogTab.FEATURED
  }
  if (
    currentTabSearchParam === TemplateDialogTab.ALL ||
    currentTabSearchParam === TemplateDialogTab.FEATURED ||
    currentTabSearchParam === TemplateDialogTab.ORG
  ) {
    return currentTabSearchParam
  }
  return TemplateDialogTab.ALL
}

function useSelectedTemplate({
  organizationTemplates,
}: {
  organizationTemplates: Array<CustomTemplate>
}): undefined | SelectedTemplate {
  const [searchParams] = useSearchParams()
  const customProjectTemplateNumber = searchParams.get(CustomTemplateParam)
  const systemTemplate = searchParams.get(SystemTemplateParam)
  const layoutTemplate = searchParams.get(LayoutTemplateParam)
  const selectedTemplate = useMemo(() => {
    if (systemTemplate) {
      const template = getInitialState().systemTemplates?.find(t => t.id.toLowerCase() === systemTemplate.toLowerCase())
      if (template) {
        return {type: 'system', template} as const
      }
    }
    if (customProjectTemplateNumber) {
      const customTemplate = organizationTemplates.find(
        template => template.projectNumber === Number(customProjectTemplateNumber),
      )
      if (customTemplate) {
        return {type: 'custom', template: customTemplate} as const
      }
    }
    if (layoutTemplate) {
      if (
        layoutTemplate === ViewType.Table ||
        layoutTemplate === ViewType.Board ||
        layoutTemplate === ViewType.Roadmap
      ) {
        return {type: 'layout', viewType: layoutTemplate} as const
      }
    }
  }, [customProjectTemplateNumber, layoutTemplate, organizationTemplates, systemTemplate])
  return selectedTemplate
}

function AllTemplatesTab({
  organizationTemplates,
  systemTemplates,
  previewTemplateCount = numberOfTemplatesToPreview,
  hideViewAll = false,
}: {
  organizationTemplates: GetCustomTemplatesResponse | null
  systemTemplates: Array<SystemTemplate>
  previewTemplateCount?: number
  /** Hide the "view all" links, e.g., when showing search results */
  hideViewAll?: boolean
}) {
  // Subset of organization templates to show on this tab
  const organizationTemplatesPreview = organizationTemplates
    ? (organizationTemplates.recommendedTemplates && organizationTemplates.recommendedTemplates.length > 0
        ? organizationTemplates.recommendedTemplates
        : organizationTemplates.templates
      ).slice(0, previewTemplateCount)
    : []
  const systemTemplatesPreview = systemTemplates.slice(0, numberOfSystemTemplatesToPreview)

  return (
    <div>
      {systemTemplatesPreview.length > 0 && (
        <Box sx={{mb: 5}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Heading as="h2" sx={{fontSize: 0, mb: 2, color: 'fg.muted'}}>
              Featured
            </Heading>
            {!hideViewAll && systemTemplates.length >= numberOfSystemTemplatesToPreview && (
              <Box as={Link} to={`?${TemplateDialogTabParam}=${TemplateDialogTab.FEATURED}`} sx={{fontSize: 0}}>
                View all
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridAutoRows: 'minmax(250px, auto)',
              gap: 3,
            }}
          >
            {systemTemplatesPreview.map(template => (
              <FeaturedTemplateCard key={template.id} template={template} />
            ))}
          </Box>
        </Box>
      )}
      {organizationTemplatesPreview.length > 0 && (
        <TemplateList
          title="From your organization"
          templates={organizationTemplatesPreview}
          metadata={
            hideViewAll ? undefined : <Link to={`?${TemplateDialogTabParam}=${TemplateDialogTab.ORG}`}>View all</Link>
          }
        />
      )}
    </div>
  )
}

function FeaturedTemplatesTab({
  systemTemplates,
  hideHeading = false,
}: {
  systemTemplates: Array<SystemTemplate>
  hideHeading?: boolean
}) {
  return (
    <div>
      {!hideHeading && (
        <Heading as="h2" sx={{fontSize: 0, mb: 2, color: 'fg.muted'}}>
          Featured
        </Heading>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridAutoRows: 'minmax(250px, auto)',
          gap: 3,
        }}
      >
        {systemTemplates.map(template => (
          <FeaturedTemplateCard key={template.id} template={template} />
        ))}
      </Box>
    </div>
  )
}

function OrganizationTemplatesTab({
  organizationTemplates,
  hideBlankslate = false,
}: {
  organizationTemplates: GetCustomTemplatesResponse
  hideBlankslate?: boolean
}) {
  if (organizationTemplates.templates.length === 0) {
    if (hideBlankslate) return null
    return (
      <Blankslate>
        <Blankslate.Visual>
          <ProjectTemplateIcon />
        </Blankslate.Visual>
        <Blankslate.Heading>No templates yet</Blankslate.Heading>
        <Blankslate.Description>
          Templates can be used to quickly get started with a new project.
        </Blankslate.Description>
        {/* Using a custom link action styling here instead of SecondaryAction, so that we can link to a new tab */}
        <Box sx={{mt: 3, mb: 2, textAlign: 'center'}}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.github.com/issues/planning-and-tracking-with-projects/managing-your-project/managing-project-templates-in-your-organization"
          >
            Learn more
          </a>
        </Box>
      </Blankslate>
    )
  }

  return (
    <div>
      {organizationTemplates.recommendedTemplates && organizationTemplates.recommendedTemplates.length > 0 && (
        <Box sx={{mb: 5}}>
          <TemplateList title="Recommended" templates={organizationTemplates.recommendedTemplates} />
        </Box>
      )}
      <Box sx={{mb: 5}}>
        <TemplateList title="All" templates={organizationTemplates.templates} />
      </Box>
    </div>
  )
}

const pillRowStyles: BetterSystemStyleObject = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '48px',
  gap: 2,
  py: 2,
}

const pillRowLabelStyles: BetterSystemStyleObject = {
  flexShrink: 0,
}

const pillContainerStyles: BetterSystemStyleObject = {
  display: 'flex',
  gap: 1,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
}

const pillStyles: BetterSystemStyleObject = {
  borderRadius: 3,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'border.default',
  py: 1,
  px: 2,
}

const pillIconStyles: BetterSystemStyleObject = {
  color: 'fg.muted',
  mr: 1,
}

const defaultTemplateImageStyles: BetterSystemStyleObject = {
  width: '100%',
  my: 3,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'border.muted',
  borderRadius: 2,
  // The aspect-ratio is the width / height of the image
  aspectRatio: '1440 / 750',
}

function DefaultTemplateImage({
  title,
  template,
}: {
  title: string
  template: Extract<SelectedTemplate, {type: 'system' | 'layout'}>
}) {
  // Only supported now for "layout templates"
  const assetName = template.type === 'layout' ? template.viewType : ''
  const oldImageUrl = useThemedMediaUrl('projectTemplateDialog', assetName)

  const {resolvedColorScheme} = useTheme()

  const imageUrl =
    template.type === 'layout'
      ? oldImageUrl
      : resolvedColorScheme === 'dark'
        ? template.template.imageUrl.dark
        : template.template.imageUrl.light

  return (
    <Box as="img" src={imageUrl} alt={`Preview screenshot for template ${title}`} sx={defaultTemplateImageStyles} />
  )
}

/** Client-side implementation for the template search */
function useTemplateSearch({
  searchQuery,
  organizationTemplates,
}: {
  searchQuery: string
  organizationTemplates: GetCustomTemplatesResponse | null
}) {
  const currentTab = useCurrentTab()
  const filteredTemplates = useMemo(() => {
    const systemTemplates =
      getInitialState().systemTemplates?.filter(template => {
        return template.title.toLowerCase().includes(searchQuery.toLowerCase())
      }) ?? []
    const orgTemplates =
      organizationTemplates?.templates.filter(template =>
        template.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ?? []
    return {organizationTemplates: orgTemplates, systemTemplates}
  }, [organizationTemplates, searchQuery])

  const showOrganizationTemplates = currentTab === TemplateDialogTab.ALL || currentTab === TemplateDialogTab.ORG
  const showSystemTemplates = currentTab === TemplateDialogTab.ALL || currentTab === TemplateDialogTab.FEATURED

  const totalCount =
    (showOrganizationTemplates ? filteredTemplates.organizationTemplates.length : 0) +
    (showSystemTemplates ? filteredTemplates.systemTemplates.length : 0)

  return {totalCount, filteredTemplates, showSearchResults: searchQuery.length > 0}
}

function TemplateDetails({
  template,
  onChangeProjectName,
  projectName,
}: {
  template: SelectedTemplate
  projectName: string
  onChangeProjectName: (newName: string) => void
}) {
  const autocompleteProps = useEmojiAutocomplete()

  const fields = useMemo(() => {
    if (template.type === 'system') {
      // todo: add fields for system templates, currently we do not have this info anywhere
      return []
    }
    if (template.type === 'custom') {
      return template.template.projectFields.filter(({customField}) => customField)
    }
    if (template.type === 'layout') {
      return []
    }
    return []
  }, [template])

  const {title, description, updatedAt} = useMemo(() => {
    if (template.type === 'layout') {
      return infoContentMap(template.viewType)
    }

    if (template.type === 'system') {
      return {
        title: template.template.title,
        description: template.template.shortDescription,
      }
    }

    return {
      title: template.template.projectTitle,
      description: template.template.projectShortDescription,
      updatedAt: template.template.projectUpdatedAt,
    }
  }, [template])

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(auto, 250px) 1fr',
        columnGap: 4,
      }}
    >
      <div>
        <div>
          <Heading as="h2" sx={{fontSize: 1, mb: 2, display: 'inline-block'}}>
            {title}
          </Heading>
          {template.type === 'system' && (
            <Box as="span" sx={{color: 'fg.muted'}}>
              {' '}
              &bull; {'GitHub'}
            </Box>
          )}
        </div>
        {description && (
          <Box as="p" sx={{color: 'fg.muted'}}>
            {description}
          </Box>
        )}
        {updatedAt && (
          <Box as="p" sx={{color: 'fg.muted'}}>
            Updated{' '}
            {formatDistanceToNow(new Date(updatedAt), {
              addSuffix: true,
            })}{' '}
          </Box>
        )}
      </div>
      <div>
        <FormControl>
          <FormControl.Label>Project name</FormControl.Label>
          <InlineAutocomplete {...autocompleteProps} fullWidth>
            <TextInput
              sx={{width: '100%'}}
              autoComplete="off"
              placeholder={title}
              value={projectName}
              onChange={e => onChangeProjectName(e.target.value)}
            />
          </InlineAutocomplete>
        </FormControl>
        {template.type === 'system' || template.type === 'layout' ? (
          <DefaultTemplateImage title={title} template={template} />
        ) : null}
        {template.type === 'custom' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '> * + *': {
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor: 'border.default',
              },
              py: 3,
            }}
          >
            <Box sx={pillRowStyles}>
              <Box sx={pillRowLabelStyles}>
                <CounterLabel sx={{mr: 2}}>{template.template.projectViews.length}</CounterLabel>
                Views
              </Box>
              <Box sx={pillContainerStyles}>
                {template.template.projectViews.map(view => (
                  <Box key={view.name} sx={pillStyles}>
                    <Octicon icon={getViewIcons(view.viewType)} sx={pillIconStyles} />
                    {view.name}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={pillRowStyles}>
              <Box sx={pillRowLabelStyles}>
                <CounterLabel sx={{mr: 2}}>{fields.length}</CounterLabel>
                Fields
              </Box>
              <Box sx={pillContainerStyles}>
                {fields.map(field => (
                  <Box key={field.name} sx={pillStyles}>
                    <Octicon icon={getColumnIcon(field.dataType)} sx={pillIconStyles} />
                    {field.name}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={pillRowStyles}>
              <Box sx={pillRowLabelStyles}>
                <CounterLabel sx={{mr: 2}}>{template.template.projectWorkflows.length}</CounterLabel>
                Workflows
              </Box>
              <Box sx={pillContainerStyles}>
                {template.template.projectWorkflows.map(workflow => (
                  <Box key={workflow.name} sx={pillStyles}>
                    <Octicon icon={WorkflowIcon} sx={pillIconStyles} />
                    {workflow.name}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={pillRowStyles}>
              <Box sx={pillRowLabelStyles}>
                <CounterLabel sx={{mr: 2}}>{template.template.projectCharts.length}</CounterLabel>
                Insights
              </Box>
              <Box sx={pillContainerStyles}>
                {template.template.projectCharts.map(chart => (
                  <Box key={chart.name} sx={pillStyles}>
                    <Octicon icon={GraphIcon} sx={pillIconStyles} />
                    {chart.name}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </div>
    </Box>
  )
}

export function TemplateDialog() {
  const {postStats} = usePostStats()
  const [, setSearchParams] = useSearchParams()
  const {setIsTemplatesDialogOpen} = useTemplateDialog()
  const closeDialog = useCallback(() => {
    setSearchParams(params => {
      params.delete(TemplateDialogTabParam)
      params.delete(CustomTemplateParam)
      params.delete(SystemTemplateParam)
      params.delete(LayoutTemplateParam)
      return params
    })
    setIsTemplatesDialogOpen(false)
  }, [setIsTemplatesDialogOpen, setSearchParams])
  const currentTab = useCurrentTab()

  const {isOrganization} = getInitialState()
  const {data: organizationTemplates = null} = useOrganizationTemplates({
    enabled: isOrganization,
  })

  const selectedTemplate = useSelectedTemplate({organizationTemplates: organizationTemplates?.templates ?? []})
  const [projectName, setProjectName] = useState(useProjectDetails().title)
  const showTemplateDetails = !!selectedTemplate

  const {applyTemplate, isApplyingTemplate} = useApplyTemplate()
  const onCreateProject = useCallback(
    async (templateToApply: SelectedTemplate) => {
      await applyTemplate({
        template: templateToApply,
        title: projectName,
        rollback: noop,
      })

      // Send telemetry
      if (templateToApply.type === 'custom') {
        postStats({
          name: TemplatesCreate,
          context: JSON.stringify({
            template: 'org_templates',
            template_project_title: templateToApply.template?.projectTitle,
            template_project_number: templateToApply.template?.projectNumber,
          }),
          ui: 'template_dialog',
        })
      } else {
        postStats({
          name: TemplatesCreate,
          context: JSON.stringify({
            template: templateToApply.type === 'layout' ? templateToApply.viewType : templateToApply.template.id,
          }),
          ui: 'template_dialog',
        })
      }

      closeDialog()
    },
    [applyTemplate, closeDialog, postStats, projectName],
  )

  const tableTemplateLink = useTemplateLink({type: 'layout', viewType: ViewType.Table})
  const boardTemplateLink = useTemplateLink({type: 'layout', viewType: ViewType.Board})
  const roadmapTemplateLink = useTemplateLink({type: 'layout', viewType: ViewType.Roadmap})

  const [searchQuery, setSearchQuery] = useState('')
  const {totalCount, showSearchResults, filteredTemplates} = useTemplateSearch({searchQuery, organizationTemplates})

  const systemTemplates = getInitialState().systemTemplates ?? []
  const searchResults = totalCount === 0 ? 'No results' : totalCount === 1 ? '1 result' : `${totalCount} results`

  const debounceAnnouncement = debounce((announcement: string) => {
    announce(announcement, {assertive: true})
  }, 100)

  useEffect(() => {
    if (searchQuery) {
      debounceAnnouncement(searchResults)
    }
  }, [debounceAnnouncement, searchQuery, searchResults])

  return (
    <Dialog
      title="Create project"
      height="large"
      sx={{
        width: ['100%', '960px'],
      }}
      onClose={() => {
        postStats({name: TemplatesCancel})
        closeDialog()
      }}
      renderHeader={({dialogLabelId, onClose}) => (
        <Dialog.Header>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2}}>
            <Box sx={{display: 'flex', gap: 1}}>
              {showTemplateDetails && (
                <Link to={{search: `?${TemplateDialogTabParam}=${currentTab}`}} aria-label="Back">
                  <Octicon icon={ArrowLeftIcon} sx={{color: 'fg.muted'}} />
                </Link>
              )}
              <Dialog.Title id={dialogLabelId}>Create project</Dialog.Title>
            </Box>
            <Dialog.CloseButton onClose={() => onClose('close-button')} />
          </Box>
        </Dialog.Header>
      )}
      renderBody={() => (
        <>
          <Dialog.Body>
            {showTemplateDetails && selectedTemplate ? (
              <TemplateDetails
                template={selectedTemplate}
                projectName={projectName}
                onChangeProjectName={setProjectName}
              />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(250px, auto) 1fr',
                  columnGap: 4,
                }}
              >
                <NavList sx={{ml: -2, mt: -4}}>
                  <NavList.Group title="Project templates">
                    {isOrganization && (
                      <NavList.Item
                        as={Link}
                        aria-current={currentTab === TemplateDialogTab.ALL ? 'page' : false}
                        to={`?${TemplateDialogTabParam}=${TemplateDialogTab.ALL}`}
                      >
                        All templates
                      </NavList.Item>
                    )}
                    <NavList.Item
                      as={Link}
                      aria-current={currentTab === TemplateDialogTab.FEATURED ? 'page' : false}
                      to={`?${TemplateDialogTabParam}=${TemplateDialogTab.FEATURED}`}
                    >
                      Featured
                    </NavList.Item>
                    {isOrganization && (
                      <NavList.Item
                        as={Link}
                        aria-current={currentTab === TemplateDialogTab.ORG ? 'page' : false}
                        to={`?${TemplateDialogTabParam}=${TemplateDialogTab.ORG}`}
                      >
                        From your organization
                      </NavList.Item>
                    )}
                  </NavList.Group>
                  <NavList.Group title="Start from scratch">
                    <NavList.Item as={Link} to={tableTemplateLink}>
                      Table
                    </NavList.Item>
                    <NavList.Item as={Link} to={boardTemplateLink}>
                      Board
                    </NavList.Item>
                    <NavList.Item as={Link} to={roadmapTemplateLink}>
                      Roadmap
                    </NavList.Item>
                  </NavList.Group>
                </NavList>
                <div>
                  <FormControl sx={{mb: 3}}>
                    <FormControl.Label visuallyHidden>Search templates</FormControl.Label>
                    <TextInput
                      block
                      leadingVisual={SearchIcon}
                      placeholder="Search templates"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      trailingAction={
                        searchQuery.length > 0 ? (
                          <TextInput.Action
                            onClick={() => setSearchQuery('')}
                            icon={XCircleFillIcon}
                            aria-label="Clear search"
                            sx={{
                              color: 'fg.subtle',
                            }}
                          />
                        ) : undefined
                      }
                    />
                  </FormControl>
                  <Heading as="h2" sx={{fontSize: 0, mb: 2}}>
                    {showSearchResults ? searchResults : ''}
                  </Heading>
                  {currentTab === TemplateDialogTab.ALL && (
                    <AllTemplatesTab
                      organizationTemplates={
                        showSearchResults ? {templates: filteredTemplates.organizationTemplates} : organizationTemplates
                      }
                      systemTemplates={showSearchResults ? filteredTemplates.systemTemplates : systemTemplates}
                      // If we are showing the search results, show a flat list of matching templates instead of just
                      // a preview of the total templates
                      previewTemplateCount={showSearchResults ? 100 : undefined}
                      hideViewAll={showSearchResults}
                    />
                  )}
                  {currentTab === TemplateDialogTab.FEATURED && (
                    <FeaturedTemplatesTab
                      systemTemplates={showSearchResults ? filteredTemplates.systemTemplates : systemTemplates}
                      hideHeading={showSearchResults}
                    />
                  )}
                  {currentTab === TemplateDialogTab.ORG && organizationTemplates && (
                    <OrganizationTemplatesTab
                      organizationTemplates={
                        showSearchResults ? {templates: filteredTemplates.organizationTemplates} : organizationTemplates
                      }
                      hideBlankslate={showSearchResults}
                    />
                  )}
                </div>
              </Box>
            )}
          </Dialog.Body>
          {/* We are rendering a custom footer here because we want to conditionally show the footer depending on
              whether we are on the details page. However, we need to consistently render the footer area so that it
              is part of the focus trap. */}
          <Dialog.Footer sx={{display: showTemplateDetails && selectedTemplate ? undefined : 'none'}}>
            {showTemplateDetails && selectedTemplate ? (
              <Button variant="primary" disabled={isApplyingTemplate} onClick={() => onCreateProject(selectedTemplate)}>
                Create project
              </Button>
            ) : null}
          </Dialog.Footer>
        </>
      )}
    />
  )
}

export function TemplateDialogWrapper() {
  const {showTemplateDialog} = getInitialState()
  const {isTemplatesDialogOpen} = useTemplateDialog()

  return showTemplateDialog && isTemplatesDialogOpen ? <TemplateDialog /> : null
}
