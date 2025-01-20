import {createRef} from 'react'

import {buildColumnModels, ColumnsContext} from '../../../client/state-providers/columns/columns-state-provider'
import {UserNoticesStateProvider} from '../../../client/state-providers/user-notices/user-notices-provider'
import {ViewOptionsMenuRefContext} from '../../../client/state-providers/view-options/use-view-options-menu-ref'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {createColumnsContext} from '../../mocks/state-providers/columns-context'
import {getSidePanelWrapper} from '../side-panel/side-panel-test-helpers'

export function createUserNoticesStateProvider(columns = [customColumnFactory.text().build({name: 'Type'})]) {
  const anchorRef = createRef<HTMLDivElement>()
  const triggerRef = createRef<HTMLButtonElement>()
  const anchor = <div ref={anchorRef}>anchor</div>
  const SidePanelProvider = getSidePanelWrapper()
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <SidePanelProvider>
      <UserNoticesStateProvider>
        <ViewOptionsMenuRefContext.Provider value={{anchorRef: triggerRef}}>
          <ColumnsContext.Provider value={createColumnsContext({allColumns: buildColumnModels(columns)})}>
            {anchor}
            {children}
          </ColumnsContext.Provider>
        </ViewOptionsMenuRefContext.Provider>
      </UserNoticesStateProvider>
    </SidePanelProvider>
  )

  return {wrapper, anchorRef, triggerRef}
}
