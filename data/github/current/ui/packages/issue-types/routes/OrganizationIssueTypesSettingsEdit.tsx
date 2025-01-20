import {Box, Label, Link} from '@primer/react'
import {Resources} from '../constants/strings'
import {Title} from '../components/Title'
import {DangerZone} from '../components/DangerZone'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {type EntryPointComponent, graphql, useFragment, usePreloadedQuery, useRelayEnvironment} from 'react-relay'
import type {OrganizationIssueTypesSettingsEditQuery} from './__generated__/OrganizationIssueTypesSettingsEditQuery.graphql'
import type {OrganizationIssueTypesSettingsEditInternalIssueType$key} from './__generated__/OrganizationIssueTypesSettingsEditInternalIssueType.graphql'
import {commitUpdateIssueTypeMutation} from '../mutations/update-issue-type-mutation'
import {formatError} from '../utils'
import {TypeName} from '../components/TypeName'
import {TypeDescription} from '../components/TypeDescription'
import {TypePrivate} from '../components/TypePrivate'
import {TypeSubmissionButtons} from '../components/TypeSubmissionButtons'
import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {useParams} from 'react-router-dom'
import {useInputFieldsErrors} from '../hooks/use-input-fields-errors'
import {useConfirmationMessage} from '../hooks/use-confirmation-message'
import {TypeColor} from '../components/TypeColor'
import {colorNames, type ColorName} from '@github-ui/use-named-color'
import type {OrganizationIssueTypesSettingsEditIssueTypes$key} from './__generated__/OrganizationIssueTypesSettingsEditIssueTypes.graphql'

export const organizationIssueType = graphql`
  query OrganizationIssueTypesSettingsEditQuery($organization_id: String!, $id: ID!) {
    viewer {
      isEnterpriseManagedUser
    }
    organization(login: $organization_id) {
      login
      issueTypes {
        ...OrganizationIssueTypesSettingsEditIssueTypes
      }
    }
    node(id: $id) {
      ... on IssueType {
        ...OrganizationIssueTypesSettingsEditInternalIssueType
      }
    }
  }
`

type InputErrors = {
  nameField?: string
  descriptionField?: string
}

export const OrganizationIssueTypesSettingsEdit: EntryPointComponent<
  {organizationIssueTypesSettingsEditQuery: OrganizationIssueTypesSettingsEditQuery},
  Record<string, never>
> = ({queries: {organizationIssueTypesSettingsEditQuery}}) => {
  const preloadedData = usePreloadedQuery<OrganizationIssueTypesSettingsEditQuery>(
    organizationIssueType,
    organizationIssueTypesSettingsEditQuery,
  )

  const {organization_id: owner, id: issueTypeId} = useParams()
  const analyticsMetadata = useMemo(
    () => ({owner: owner ?? '', issueTypeId: issueTypeId?.toString() ?? ''}),
    [owner, issueTypeId],
  )

  if (!preloadedData?.node || !preloadedData?.organization?.login) return null

  return (
    <AnalyticsProvider appName="issue_types" category="edit" metadata={analyticsMetadata}>
      <OrganizationIssueTypesSettingsEditInternal
        issueTypeKey={preloadedData.node}
        owner={preloadedData.organization.login}
        issueTypes={preloadedData.organization.issueTypes}
        isEnterpriseManagedUser={preloadedData?.viewer?.isEnterpriseManagedUser || false}
      />
    </AnalyticsProvider>
  )
}

type OrganizationIssueTypesSettingsEditInternalProps = {
  issueTypeKey: OrganizationIssueTypesSettingsEditInternalIssueType$key
  owner: string
  isEnterpriseManagedUser: boolean
  issueTypes?: OrganizationIssueTypesSettingsEditIssueTypes$key | null
}

const OrganizationIssueTypesSettingsEditInternal = ({
  issueTypeKey,
  owner,
  isEnterpriseManagedUser,
  issueTypes,
}: OrganizationIssueTypesSettingsEditInternalProps) => {
  const environment = useRelayEnvironment()
  const data = useFragment<OrganizationIssueTypesSettingsEditInternalIssueType$key>(
    graphql`
      fragment OrganizationIssueTypesSettingsEditInternalIssueType on IssueType {
        description
        id
        isPrivate
        isEnabled
        name
        color
        ...DangerZoneIssueType
      }
    `,
    issueTypeKey,
  )

  const issueTypesData = useFragment<OrganizationIssueTypesSettingsEditIssueTypes$key>(
    graphql`
      fragment OrganizationIssueTypesSettingsEditIssueTypes on IssueTypeConnection {
        edges {
          node {
            id
            name
          }
        }
      }
    `,
    issueTypes,
  )

  const [name, setName] = useState<string>(data.name || '')
  const [description, setDescription] = useState<string>(data.description || '')
  const effectiveColor = useMemo(() => colorNames.find(c => c === data.color) || 'GRAY', [data.color])
  const [color, setColor] = useState<ColorName>(effectiveColor)
  const [isPrivate, setIsPrivate] = useState<boolean>(data.isPrivate)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isEdited, setIsEdited] = useState<boolean>(false)

  const {saveConfirmationRef, changesSaved, showConfirmationMessage} = useConfirmationMessage()

  const existingIssueTypeNames = useMemo(() => {
    return (
      issueTypesData?.edges
        ?.map(e => {
          if (e?.node?.id !== data.id) {
            return e?.node?.name
          }
        })
        .filter(n => n !== undefined && n !== null) ?? []
    )
  }, [data.id, issueTypesData?.edges])

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

  const handleUpdate = useCallback(() => {
    const valid = validate()

    if (!valid) {
      setShouldFocusError(true)
      return
    }

    if (!isEdited) {
      // Shows changes saved confirmation when user reverts changes and clicks `Save`
      showConfirmationMessage(true)
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)
    commitUpdateIssueTypeMutation({
      environment,
      input: {
        issueTypeId: data.id,
        description,
        name,
        color,
        isPrivate,
        isEnabled: data.isEnabled,
      },
      onError: () => {
        setIsSubmitting(false)
      },
      onCompleted: response => {
        const errors = response.updateIssueType?.errors || []
        if (errors.length > 0) {
          const inputErrors: InputErrors = {}

          errors.map((e: {message: string}) => {
            reportError(formatError('UpdateIssueType', e.message))
            if (e.message.startsWith('Name')) {
              inputErrors.nameField = e.message
              setNameError(e.message)
            } else if (e.message.startsWith('Description')) {
              inputErrors.descriptionField = e.message
              setDescriptionError(e.message)
            }
          })
          setShouldFocusError(true)
        } else {
          showConfirmationMessage(true)
        }
        setIsSubmitting(false)
      },
    })
  }, [
    color,
    data.id,
    data.isEnabled,
    description,
    environment,
    isEdited,
    isPrivate,
    isSubmitting,
    name,
    setDescriptionError,
    setNameError,
    setShouldFocusError,
    showConfirmationMessage,
    validate,
  ])

  const handleRevert = useCallback(() => {
    setName(data.name)
    setDescription(data.description || '')
    const initialColor = colorNames.find(c => c === data.color)
    setColor(initialColor || 'GRAY')
    setIsPrivate(data.isPrivate)
    setNameError('')
    setDescriptionError('')
  }, [data.color, data.description, data.isPrivate, data.name, setDescriptionError, setNameError])

  useEffect(() => {
    const isDirty =
      data.name !== name || data.description !== description || data.isPrivate !== isPrivate || data.color !== color
    setIsEdited(isDirty)
    if (isDirty) {
      showConfirmationMessage(false)
    }
  }, [
    color,
    data.color,
    data.description,
    data.isPrivate,
    data.name,
    description,
    isPrivate,
    name,
    showConfirmationMessage,
  ])

  return (
    <div>
      <Title page="edit">
        <Link href={`/organizations/${owner}/settings/issue-types`}>{Resources.settingsPageHeader}</Link>
        {` / ${data.name}`}
        {!data.isEnabled && <Label sx={{ml: 2, verticalAlign: '4px'}}>Disabled</Label>}
      </Title>
      <Box sx={{mb: 4}}>
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
          confirmLabel={Resources.saveAfterEditingButton}
          cancelLabel={Resources.revertButton}
          onCancel={handleRevert}
          onConfirm={handleUpdate}
          changesSaved={changesSaved}
          ref={saveConfirmationRef}
        />
      </Box>
      {/* delete/disable (danger zone) */}
      <DangerZone issueType={data} owner={owner} />
    </div>
  )
}
