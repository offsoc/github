import {ActionMenu, ActionList} from '@primer/react'
import {useState} from 'react'
import {OrgItem} from './OrgItem'
import type {Org, OrgsToUpdate} from '../types'

export function OrgSelect({
  organizations,
  orgsToUpdate,
  setOrgsToUpdate,
  children,
  disableForm,
}: {
  organizations: Org[]
  orgsToUpdate: OrgsToUpdate
  setOrgsToUpdate: (orgs: object) => void
  children: React.ReactNode
  disableForm: boolean
}) {
  const [checkedOrgs, setCheckedOrgs] = useState({} as OrgsToUpdate)

  const handleSelectAllClick = () => {
    const orgs = {} as OrgsToUpdate
    if (Object.keys(checkedOrgs).length === 0) {
      for (const org of organizations) {
        orgs[org.id] = 'checked'
      }
    }
    setCheckedOrgs(orgs)
  }

  const bulkUpdateEnablement = (enablement: string) => {
    const selectedOrgsIds = Object.keys(checkedOrgs)

    const orgs = {} as OrgsToUpdate
    for (const k of selectedOrgsIds) {
      const id: number = parseInt(k)
      orgs[id] = enablement
    }

    setOrgsToUpdate({...orgsToUpdate, ...orgs})
  }

  const handleCheckClick = (id: number) => {
    if (checkedOrgs[id]) {
      // remove from checkedOrgs
      const copy = {...checkedOrgs}
      delete copy[id]
      setCheckedOrgs(copy)
    } else {
      // add to checkedOrgs
      setCheckedOrgs({...checkedOrgs, [id]: 'checked'})
    }
  }

  const BulkActionMenu = () => {
    return (
      <ActionMenu>
        <ActionMenu.Button>Set organization access</ActionMenu.Button>
        <ActionMenu.Overlay width="medium">
          <ActionList>
            <ActionList.Item onSelect={() => bulkUpdateEnablement('enable')}>
              Enable
              <ActionList.Description variant="block">
                Selected organizations may control access to Codespaces
              </ActionList.Description>
            </ActionList.Item>
            <ActionList.Item onSelect={() => bulkUpdateEnablement('disable')}>
              Disable
              <ActionList.Description variant="block">
                Selected organizations won’t have access to Codespaces
              </ActionList.Description>
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    )
  }

  return (
    <div className="Box rounded-top-2 rounded-0" data-testid="org-select">
      <div className="Box-header">
        <div className="Box-title">
          <div className="d-inline-flex flex-justify-between width-full">
            <div>
              <form>
                <label className="table-list-header-meta py-1">
                  <input
                    type="checkbox"
                    id="select-all-checkbox"
                    data-testid="select-all-checkbox"
                    className="mr-2"
                    onClick={handleSelectAllClick}
                  />
                  <span id="codespaces-org-select-default-header">Select organizations</span>
                </label>
              </form>
            </div>
            <div className="flex-justify-between">
              <BulkActionMenu />
            </div>
          </div>
        </div>
      </div>
      <ul>
        <li className="Box-row">{children}</li>
        {organizations.map(org => (
          <li className="Box-row" key={org.id}>
            <OrgItem
              org={org}
              enabled={orgsToUpdate[org.id] ? orgsToUpdate[org.id] === 'enable' : org.enablementStatus === 'Enabled'}
              updateOrgEnablement={enablement => setOrgsToUpdate({...orgsToUpdate, ...{[org.id]: enablement}})}
              disableForm={disableForm}
              checked={!!checkedOrgs[org.id]}
              handleCheckClick={id => handleCheckClick(id)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
