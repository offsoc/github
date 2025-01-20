import {renderHook} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import {useBindMemexToDocument} from '../../client/hooks/use-bind-memex-to-document'
import {useSidePanel} from '../../client/hooks/use-side-panel'
import {useViews} from '../../client/hooks/use-views'
import {
  ProjectDetailsContext,
  type ProjectDetailsContextType,
  ProjectNumberContext,
  type ProjectNumberContextType,
} from '../../client/state-providers/memex/memex-state-provider'
import {useCustomFieldsSettings} from '../../client/state-providers/settings/use-custom-fields-settings'
import {asMockHook} from '../mocks/stub-utilities'
import {defaultProjectDetails, existingProject} from '../state-providers/memex/helpers'

jest.mock('../../client/hooks/use-side-panel')
jest.mock('../../client/hooks/use-views')
jest.mock('../../client/state-providers/settings/use-custom-fields-settings')

function createOptions(
  projectNumberValue: () => ProjectNumberContextType,
  projectDetailsValue: () => ProjectDetailsContextType,
  route: string,
) {
  const wrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
      <MemoryRouter initialEntries={[route]}>
        <ProjectNumberContext.Provider value={projectNumberValue()}>
          <ProjectDetailsContext.Provider value={projectDetailsValue()}>{children}</ProjectDetailsContext.Provider>
        </ProjectNumberContext.Provider>
      </MemoryRouter>
    )
  }
  return {wrapper}
}

describe('useBindMemexToDocument', () => {
  beforeAll(() => {
    asMockHook(useViews).mockReturnValue({currentView: undefined})
    asMockHook(useSidePanel).mockReturnValue({sidePanelState: undefined})
    asMockHook(useCustomFieldsSettings).mockReturnValue({currentColumnTitle: undefined})
  })

  it('updates title in settings of project when going through different settings', () => {
    let route = '/orgs/github/projects/1/settings/fields/1'
    const {rerender} = renderHook(
      useBindMemexToDocument,
      createOptions(
        () => existingProject(),
        () => defaultProjectDetails({title: 'My Memex Title!'}),
        route,
      ),
    )

    asMockHook(useCustomFieldsSettings).mockReturnValue({currentColumnTitle: 'Pizza field settings'})
    rerender()
    expect(document.title).toBe('Pizza field settings · Settings · My Memex Title!')

    route = '/orgs/github/projects/1/settings'
    asMockHook(useCustomFieldsSettings).mockReturnValue({currentColumnTitle: undefined})
    rerender()
    expect(document.title).toBe('Settings · My Memex Title!')
  })

  it('sets document.title and emits an event when memex title is changed', () => {
    let title = ''

    const {rerender} = renderHook(
      useBindMemexToDocument,
      createOptions(
        () => existingProject(),
        () => defaultProjectDetails({title}),
        '/orgs/github/projects/1',
      ),
    )
    const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent')

    title = 'My Memex Title!'

    rerender()
    expect(document.title).toBe('My Memex Title!')
    expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent))
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('context-region-label:update')
    expect((dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail).toEqual({label: 'My Memex Title!'})

    title = 'Team Novelty Aardavarks'

    rerender()
    expect(document.title).toBe('Team Novelty Aardavarks')
    expect(dispatchEventSpy).toHaveBeenCalledTimes(2)
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent))
    expect(dispatchEventSpy.mock.calls[1][0].type).toBe('context-region-label:update')
    expect((dispatchEventSpy.mock.calls[1][0] as CustomEvent).detail).toEqual({label: 'Team Novelty Aardavarks'})
  })

  it('updates title correctly with view and content data', () => {
    const {rerender} = renderHook(
      useBindMemexToDocument,
      createOptions(
        () => existingProject(),
        () => defaultProjectDetails({title: 'My Memex Title!'}),
        '/orgs/github/projects/1',
      ),
    )

    rerender()
    expect(document.title).toBe('My Memex Title!')

    asMockHook(useViews).mockReturnValue({currentView: {name: 'Team View'} as any})
    rerender()
    expect(document.title).toBe('Team View · My Memex Title!')

    asMockHook(useSidePanel).mockReturnValue({
      sidePanelState: {item: {getRawTitle: () => 'Important Issue Title'}} as any,
    })
    rerender()
    expect(document.title).toBe('Important Issue Title · My Memex Title!')
  })
})
