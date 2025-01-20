import {testIdProps} from '@github-ui/test-id-props'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList/Item'
import {useCallback} from 'react'

/**
 * Use this function to stub out the <SelectPanel> component.
 *
 * @returns A mock implementation of the <SelectPanel> @primer/react component,
 * that doesn't rely on a registered Portal.
 */
export const mockSelectPanel = () => {
  return jest.fn().mockImplementation((props: {items: Array<ItemProps & {name?: string}>}) => {
    const getItemText = useCallback((item: ItemProps & {name?: string}): string | undefined => {
      // AssigneesEditor uses the text property.
      if (item.text) {
        return item.text
      }

      // LabelsEditor uses the name property.
      if ('name' in item) {
        return item.name
      }
    }, [])

    return (
      <div {...testIdProps('select-panel')}>
        {props.items.map((item, index) => (
          <div key={index}>{getItemText(item)}</div>
        ))}
      </div>
    )
  })
}
