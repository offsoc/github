import {useState, type FormEvent} from 'react'
import {Button, Flash, Heading} from '@primer/react'
import {GroupNameField} from './GroupFormFields/GroupNameField'
import {ManageForkDestinationsField} from './GroupFormFields/ManageForkDestinationsField'
import {ForkDestinationsField} from './GroupFormFields/ForkDestinationsField'
import {ManageAccessPermissionsField} from './GroupFormFields/ManageAccessPermissionsField'
import {AccessPermissionsField} from './GroupFormFields/AccessPermissionsField'
import {AllowAdditionalCollaboratorsField} from './GroupFormFields/AllowAdditionalCollaboratorsField'
import {LiveBanner} from './LiveBanner'
import {type ForkDestination, type Group, PAGE, type FormPayload} from '../types'
import {useGroupFormContext} from '../contexts/GroupFormContext'
import {useBasePath} from '../contexts/BasePathContext'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useNavigate} from '@github-ui/use-navigate'
import {RepositoryListField} from './GroupFormFields/RepositoryListField'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

export function GroupForm({group, page}: {group?: Group; page: PAGE}) {
  const {isRoot} = useRoutePayload<FormPayload>()
  const navigate = useNavigate()
  const form = useGroupFormContext()
  const basePath = useBasePath()
  const [errorMessage, setErrorMessage] = useState<string>()
  const channel = group?.orchestration?.channel
  const isExistingGroup = !!group?.id

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    // here's where we can call form.validate() once we have those configured per field
    const body = form.getBody()
    const url = isExistingGroup ? `${basePath}/${group.id}` : `${basePath}/new`
    const response = await verifiedFetchJSON(url, {
      method: isExistingGroup ? 'PUT' : 'POST',
      body: {
        group: {
          ...body,
          id: group?.id,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          ...(body.manageAccessPermissions
            ? {}
            : {
                accessPermissions: undefined,
                allowAdditionalCollaborators: undefined,
              }),
        },
      },
    })
    if (response.ok) {
      const {id} = await response.json()
      navigate(`${basePath}/${id}`)
    } else {
      const error = await response.json()
      setErrorMessage(error.message || 'Group failed to save')
    }
  }

  const forkDestinations: ForkDestination[] = group?.directSettings?.forkDestinations
    ? Object.keys(group?.directSettings?.forkDestinations)
        .filter(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          (key: ForkDestination) => group?.directSettings?.forkDestinations[key.toLowerCase()],
        )
        .map(key => key.toUpperCase() as ForkDestination)
    : []

  const manageAccessPermissions = group?.directSettings?.accessPermissions !== null

  return (
    <form
      onSubmit={onSubmit}
      action={`${basePath}/${group?.group_path || 'new'}`}
      method="POST"
      className="d-flex flex-column gap-3"
    >
      <LiveBanner channel={channel} initialState={group?.orchestration} isFormTouched={form.isTouched} />

      {errorMessage ? <Flash variant="danger">{errorMessage}</Flash> : null}

      <GroupNameField
        initialValue={group?.group_path}
        isRoot={isRoot}
        readOnlyOverride={isRoot && page === PAGE.Show}
      />
      <Heading as="h2" className="h4">
        Managed Settings
      </Heading>
      <hr className="my-0" />
      <ManageAccessPermissionsField initialValue={manageAccessPermissions} />
      {/* @ts-expect-error typing doesn't describe `manageAccessPermissions` */}
      {form.state['manageAccessPermissions']?.value ? (
        <div className="ml-4 d-flex flex-column gap-3">
          <AccessPermissionsField
            initialValue={group?.directSettings?.accessPermissions?.teams}
            inheritedTeams={group?.inheritedSettings?.accessPermissions?.teams}
            inherited={group?.inheritedSettings?.accessPermissions?.allowAdditionalCollaborators === false}
          />
          <AllowAdditionalCollaboratorsField
            initialValue={
              group?.inheritedSettings?.accessPermissions?.allowAdditionalCollaborators === false
                ? false
                : group?.directSettings?.accessPermissions?.allowAdditionalCollaborators
            }
            inherited={group?.inheritedSettings?.accessPermissions?.allowAdditionalCollaborators === false}
          />
        </div>
      ) : null}
      <ManageForkDestinationsField initialValue={forkDestinations.length !== 3} />
      {/* @ts-expect-error typing doesn't describe `manageForkDestination` */}
      {form.state['manageForkDestination']?.value ? (
        <div className="Box p-3 ml-4 d-flex flex-column gap-2">
          <ForkDestinationsField initialValue={forkDestinations} />
        </div>
      ) : null}
      <hr className="my-0" />
      <RepositoryListField initialValue={group?.repos} group={group} />
      <div className="d-flex flex-row gap-2">
        <Button type="submit" variant="primary">
          Save
        </Button>
        <Button type="reset">Cancel</Button>
      </div>
    </form>
  )
}
