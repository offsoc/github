import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import type {BypassListPanelProps} from '../BypassListPanel'
import {BypassListPanel} from '../BypassListPanel'
import {ActorBypassMode, type BypassActor, OrgAdminBypassMode} from '@github-ui/bypass-actors/types'

const bypassActors: BypassActor[] = [
  {
    id: 1,
    _id: 1,
    name: 'read',
    actorId: 1,
    actorType: 'RepositoryRole',
    _enabled: true,
    _dirty: false,
    bypassMode: ActorBypassMode.ALWAYS,
  },
  {
    id: 2,
    _id: 2,
    name: 'Super bot',
    actorId: 1,
    actorType: 'Integration',
    _enabled: true,
    _dirty: false,
    bypassMode: ActorBypassMode.ALWAYS,
  },
  {
    id: 3,
    _id: 3,
    name: 'Repo team',
    actorId: 1,
    actorType: 'Team',
    _enabled: true,
    _dirty: false,
    bypassMode: ActorBypassMode.ALWAYS,
  },
]

const defaultProps: BypassListPanelProps = {
  readOnly: false,
  bypassActors,
  addBypassActor: jest.fn(),
  removeBypassActor: jest.fn(),
  setBypassActors: jest.fn(),
  updateBypassActor: jest.fn(),
  orgAdminBypassMode: OrgAdminBypassMode.NoOrgBypass,
  deployKeyBypass: false,
  rulesetTarget: 'branch',
  setFlashAlert: () => {},
}

describe('BypassListPanel', () => {
  test('should render given an empty list of bypass actors', () => {
    render(<BypassListPanel {...defaultProps} bypassActors={[]} />)

    expect(screen.getAllByText('Bypass list')).toHaveLength(1)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  test('should render given a list of each type of supported actor', () => {
    render(<BypassListPanel {...defaultProps} />)

    expect(screen.getAllByText('Bypass list')).toHaveLength(2)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)

    expect(listItems[0]).toHaveTextContent('read')
    expect(listItems[0]).toHaveTextContent('Role')

    expect(listItems[1]).toHaveTextContent('Super bot')
    expect(listItems[1]).toHaveTextContent('App')

    expect(listItems[2]).toHaveTextContent('Repo team')
    expect(listItems[2]).toHaveTextContent('Team')
    expect(listItems[2]).toHaveTextContent('@Repo team')
  })
})
