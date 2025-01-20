import {ActionList, ActionMenu, Link} from '@primer/react'
import {taskOptions, modelFamilyOptions, categoryOptions} from '../../utilities/model-filter-options'

export default function ModelsIndexFilters() {
  return (
    <div className="d-flex gap-2 flex-wrap">
      <ActionMenu>
        <ActionMenu.Button data-testid="creator-button">
          <span className="fgColor-muted">By:</span> All providers
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="creator-menu">
            {modelFamilyOptions.map(option => (
              <Link muted key={option} href={`/marketplace?type=models&model_family=${option}`}>
                <ActionList.Item key={option} selected={option === 'All'}>
                  {option}
                </ActionList.Item>
              </Link>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      <ActionMenu>
        <ActionMenu.Button data-testid="creator-button">
          <span className="fgColor-muted">Capability:</span> All
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="creator-menu">
            {taskOptions.map(option => (
              <Link muted key={option} href={`/marketplace?type=models&task=${option}`}>
                <ActionList.Item key={option} selected={option === 'All'}>
                  {option.toLowerCase() === 'chat-completion' ? 'Chat/completion' : option}
                </ActionList.Item>
              </Link>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      <ActionMenu>
        <ActionMenu.Button data-testid="creator-button">
          <span className="fgColor-muted">Tag:</span> All
        </ActionMenu.Button>
        <ActionMenu.Overlay width="small">
          <ActionList selectionVariant="single" data-testid="creator-menu">
            {categoryOptions.map(option => (
              <Link muted key={option} href={`/marketplace?type=models&category=${option}`}>
                <ActionList.Item key={option} selected={option === 'All'}>
                  {option}
                </ActionList.Item>
              </Link>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  )
}
