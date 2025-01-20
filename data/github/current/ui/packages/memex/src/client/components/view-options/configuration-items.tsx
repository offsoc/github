import {testIdProps} from '@github-ui/test-id-props'
import {ChevronRightIcon} from '@primer/octicons-react'
import {ActionList} from '@primer/react'
import {forwardRef, memo} from 'react'

import {ViewType} from '../../helpers/view-type'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useViewType} from '../../hooks/use-view-type'
import {useViews} from '../../hooks/use-views'
import {type ConfigurationOption, optionsForViewType} from './configuration'

type ListItemType = React.PropsWithChildren<
  Omit<ConfigurationOption, 'TextContent'> & {
    onSelect: (option: ConfigurationOption['title']) => void
    disabled?: boolean
  }
>

const ListItem = memo(
  forwardRef<HTMLLIElement, ListItemType>(({title, testId, children, disabled, icon: Icon, onSelect}, ref) => {
    return (
      <ActionList.Item
        ref={ref}
        disabled={disabled}
        {...testIdProps(`view-options-menu-item-${testId}`)}
        onSelect={e => {
          onSelect(title)
          e.preventDefault()
        }}
      >
        <ActionList.LeadingVisual>
          <Icon />
        </ActionList.LeadingVisual>

        {children}

        <ActionList.TrailingVisual>
          <ChevronRightIcon />
        </ActionList.TrailingVisual>
      </ActionList.Item>
    )
  }),
)

export const ConfigurationItems = memo(
  forwardRef<
    HTMLLIElement,
    {
      selectedOption: ConfigurationOption['title'] | null
      onSelect: (option: ConfigurationOption['title']) => void
    }
  >(({onSelect, selectedOption}, ref) => {
    const {viewType} = useViewType()
    const {currentView} = useViews()
    const enabledFeatures = useEnabledFeatures()

    const options = optionsForViewType[viewType]
    if (!options || !currentView) return null

    return (
      <ActionList.Group variant="subtle">
        <ActionList.GroupHeading>Configuration</ActionList.GroupHeading>
        {options.map(option => {
          if (option.hideIf({currentView, enabledFeatures})) return null
          const disabled =
            enabledFeatures.memex_table_without_limits &&
            !enabledFeatures.memex_mwl_swimlanes &&
            option.title === 'Group by' &&
            viewType === ViewType.Board

          return (
            <ListItem
              {...option}
              ref={option.title === selectedOption ? ref : undefined}
              disabled={disabled}
              key={option.title}
              onSelect={onSelect}
            >
              <option.TextContent />
            </ListItem>
          )
        })}
      </ActionList.Group>
    )
  }),
)

export const ConfigurationItemMenus = memo(function ConfigurationItemMenus({
  currentMenu,
  setShowSubMenu,
  anchorRef,
}: {
  currentMenu: ConfigurationOption['title'] | null
  setShowSubMenu: (next: ConfigurationOption['title'] | null) => void
  anchorRef: React.RefObject<HTMLElement>
}) {
  const {viewType} = useViewType()
  const {currentView} = useViews()
  const enabledFeatures = useEnabledFeatures()

  const options = optionsForViewType[viewType]
  if (!options || !currentView) return null

  return (
    <>
      {options.map(({MenuComponent, title, ...option}) => {
        if (option.hideIf({currentView, enabledFeatures})) return null

        return (
          <MenuComponent
            key={title}
            anchorRef={anchorRef}
            open={currentMenu === title}
            setOpen={nextOpen => {
              setShowSubMenu(nextOpen ? title : null)
            }}
          />
        )
      })}
    </>
  )
})
