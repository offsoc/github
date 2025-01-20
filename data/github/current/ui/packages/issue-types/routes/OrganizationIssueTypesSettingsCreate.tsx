import {Box, Link, Text} from '@primer/react'
import {Resources} from '../constants/strings'
import {Title} from '../components/Title'
import {useCallback, useMemo, useState} from 'react'
import {commitCreateIssueTypeMutation} from '../mutations/create-issue-type-mutation'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {type EntryPointComponent, graphql, useFragment, usePreloadedQuery, useRelayEnvironment} from 'react-relay'
import type {OrganizationIssueTypesSettingsCreateQuery} from './__generated__/OrganizationIssueTypesSettingsCreateQuery.graphql'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {formatError} from '../utils'
import {TypeName} from '../components/TypeName'
import {TypeDescription} from '../components/TypeDescription'
import {TypePrivate} from '../components/TypePrivate'
import {TypeSubmissionButtons} from '../components/TypeSubmissionButtons'
import {useIssueTypesAnalytics} from '../hooks/use-issue-types-analytics'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {useParams} from 'react-router-dom'
import {useInputFieldsErrors} from '../hooks/use-input-fields-errors'
import {TypeColor} from '../components/TypeColor'
import type {ColorName} from '@github-ui/use-named-color'
import {ORGANIZATION_ISSUE_TYPES_LIMIT} from '../constants/constants'
import type {OrganizationIssueTypesSettingsCreateIssueTypes$key} from './__generated__/OrganizationIssueTypesSettingsCreateIssueTypes.graphql'

export const organizationIssueTypesQuery = graphql`
  query OrganizationIssueTypesSettingsCreateQuery($organization_id: String!) {
    viewer {
      isEnterpriseManagedUser
    }
    organization(login: $organization_id) {
      id
      login
      issueTypes {
        ...OrganizationIssueTypesSettingsCreateIssueTypes
      }
    }
  }
`

export const OrganizationIssueTypesSettingsCreate: EntryPointComponent<
  {organizationIssueTypesSettingsCreateQuery: OrganizationIssueTypesSettingsCreateQuery},
  Record<string, never>
> = ({queries: {organizationIssueTypesSettingsCreateQuery}}) => {
  const preloadedData = usePreloadedQuery<OrganizationIssueTypesSettingsCreateQuery>(
    organizationIssueTypesQuery,
    organizationIssueTypesSettingsCreateQuery,
  )

  const {organization_id: owner} = useParams()
  const analyticsMetadata = useMemo(() => ({owner: owner ?? ''}), [owner])

  if (!preloadedData?.organization?.id) return null

  return (
    <AnalyticsProvider appName="issue_types" category="create" metadata={analyticsMetadata}>
      <OrganizationIssueTypesSettingsCreateInternal
        ownerId={preloadedData.organization.id}
        ownerName={preloadedData.organization.login}
        issueTypes={preloadedData.organization.issueTypes}
        isEnterpriseManagedUser={preloadedData?.viewer?.isEnterpriseManagedUser || false}
      />
    </AnalyticsProvider>
  )
}

type OrganizationIssueTypesSettingsCreateInternalProps = {
  ownerId: string
  ownerName: string
  issueTypes?: OrganizationIssueTypesSettingsCreateIssueTypes$key | null
  isEnterpriseManagedUser: boolean
}

const OrganizationIssueTypesSettingsCreateInternal = ({
  ownerId,
  ownerName,
  issueTypes,
  isEnterpriseManagedUser,
}: OrganizationIssueTypesSettingsCreateInternalProps) => {
  const data = useFragment<OrganizationIssueTypesSettingsCreateIssueTypes$key>(
    graphql`
      fragment OrganizationIssueTypesSettingsCreateIssueTypes on IssueTypeConnection {
        totalCount
        edges {
          node {
            name
          }
        }
      }
    `,
    issueTypes,
  )
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()

  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [color, setColor] = useState<ColorName>('GRAY')
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const {sendIssueTypesAnalyticsEvent} = useIssueTypesAnalytics()

  const existingIssueTypeNames = useMemo(() => {
    return data?.edges?.map(e => e?.node?.name).filter(n => n !== undefined) ?? []
  }, [data])
  const {
    typeNameRef,
    typeDescriptionRef,
    nameError,
    setNameError,
    descriptionError,
    setDescriptionError,
    setShouldFocusError,
    validate,
  } = useInputFieldsErrors(existingIssueTypeNames)

  const handleCancel = () => {
    if (ssrSafeWindow) {
      ssrSafeWindow.location.href = `/organizations/${ownerName}/settings/issue-types`
    }
  }

  const handleCreate = useCallback(() => {
    const valid = validate()

    if (!valid) {
      setShouldFocusError(true)
      return
    }

    sendIssueTypesAnalyticsEvent('org_issue_type.create', 'ORG_ISSUE_TYPE_CREATE_BUTTON')
    setIsSubmitting(true)
    commitCreateIssueTypeMutation({
      environment,
      input: {
        ownerId,
        name,
        description,
        color,
        isEnabled: true,
        isPrivate,
        // not providing issue type as it will be set to custom by default on the backend and the four default types get created by enabling them, not by going to the create page
      },
      onError: () => {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: Resources.creatingIssueTypeError,
        })
        setIsSubmitting(false)
      },
      onCompleted: response => {
        const errors = response.createIssueType?.errors || []
        if (errors.length === 0) {
          if (ssrSafeWindow) {
            ssrSafeWindow.location.href = `/organizations/${ownerName}/settings/issue-types`
            return
          }
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'success',
            message: Resources.creatingIssueTypeSuccess,
          })
        } else {
          errors.map((e: {message: string}) => {
            reportError(formatError('UpdateIssueType', e.message))
            if (e.message.startsWith('Name')) {
              setNameError(e.message)
            } else if (e.message.startsWith('Description')) {
              setDescriptionError(e.message)
            } else if (e.message.startsWith('Maximum')) {
              // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
              addToast({
                type: 'error',
                message: e.message,
              })
            }
          })
          setShouldFocusError(true)
        }
        setIsSubmitting(false)
      },
    })
  }, [
    validate,
    addToast,
    color,
    description,
    environment,
    isPrivate,
    name,
    ownerId,
    ownerName,
    sendIssueTypesAnalyticsEvent,
    setDescriptionError,
    setNameError,
    setShouldFocusError,
  ])

  return (
    <div>
      <Title page="create">
        <Link href={`/organizations/${ownerName}/settings/issue-types`}>{Resources.settingsPageHeader}</Link>
        {` / ${Resources.newTitle}`}
      </Title>
      <Box sx={{mb: 4}}>
        {/* Hide the form if there are 10 issue types already */}
        {data?.totalCount === ORGANIZATION_ISSUE_TYPES_LIMIT ? (
          <Box sx={{mt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Text sx={{fontWeight: 600}}>You have reached the maximum number of issue types</Text>
            <Text sx={{color: 'fg.subtle'}}>To create a new one, please remove an existing type.</Text>
          </Box>
        ) : (
          <>
            <TypeName
              disabled={isSubmitting}
              name={name}
              setName={setName}
              error={nameError}
              setError={setNameError}
              ref={typeNameRef}
            />
            <TypeDescription
              disabled={isSubmitting}
              description={description}
              setDescription={setDescription}
              error={descriptionError}
              setError={setDescriptionError}
              ref={typeDescriptionRef}
            />
            <TypeColor color={color} setColor={setColor} />
            {!isEnterpriseManagedUser && (
              <TypePrivate disabled={isSubmitting} isPrivate={isPrivate} setIsPrivate={setIsPrivate} />
            )}
            <TypeSubmissionButtons
              disabled={isSubmitting}
              confirmLabel={Resources.saveCreatedIssueTypeButton}
              onCancel={handleCancel}
              onConfirm={handleCreate}
            />
          </>
        )}
      </Box>
    </div>
  )
}
