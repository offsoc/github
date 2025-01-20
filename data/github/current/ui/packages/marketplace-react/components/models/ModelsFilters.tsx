import {ActionList, ActionMenu} from '@primer/react'
import {useFilterContext} from '../../contexts/FilterContext'
import {taskOptions, modelFamilyOptions, categoryOptions} from '../../utilities/model-filter-options'

export default function ModelsFilters() {
  const {task, setTask, modelFamily, setModelFamily, category, setCategory} = useFilterContext()

  const onTaskChange = (newTask: string) => {
    setTask(newTask)
  }

  const onModelFamilyChange = (newModelFamily: string) => {
    setModelFamily(newModelFamily)
  }

  const onCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
  }

  return (
    <div className="d-flex gap-2 flex-wrap">
      <ActionMenu>
        <ActionMenu.Button data-testid="family-button">
          <span className="fgColor-muted">By:</span> {modelFamily}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="creator-menu">
            {modelFamilyOptions.map(option => (
              <ActionList.Item
                key={option}
                selected={option === modelFamily}
                onSelect={() => onModelFamilyChange(option)}
              >
                {option}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      <ActionMenu>
        <ActionMenu.Button data-testid="task-button">
          <span className="fgColor-muted">Capability:</span>{' '}
          {task?.toLowerCase() === 'chat-completion' ? 'Chat/completion' : task}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="creator-menu">
            {taskOptions.map(option => (
              <ActionList.Item key={option} selected={option === task} onSelect={() => onTaskChange(option)}>
                {option.toLowerCase() === 'chat-completion' ? 'Chat/completion' : option}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      <ActionMenu>
        <ActionMenu.Button data-testid="category-button">
          <span className="fgColor-muted">Tag:</span> {category || 'All'}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="creator-menu">
            {categoryOptions.map(option => {
              // Default to "All" if no category is selected. We can't do this with default state
              // because `category` is shared between models and apps/actions
              let selected = option === category
              if (option === 'All' && !category) {
                selected = true
              }
              return (
                <ActionList.Item key={option} selected={selected} onSelect={() => onCategoryChange(option)}>
                  {option}
                </ActionList.Item>
              )
            })}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  )
}
