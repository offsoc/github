import {ListWithTasks, MarkdownBodyWrapper} from '../__tests__/wrappers'

export type TasklistTestData = {
  type: 'listitem' | 'tasklistitem'
  title: string | JSX.Element
  children?: TasklistTestData[]
}

const buildTasklistItem = (data: TasklistTestData, index: number) => {
  if (data.type === 'listitem') {
    return (
      <li key={`${data.title}-${index}`}>
        <>{data.title}</>
        {data.children ? buildParentList(data.children) : <></>}
      </li>
    )
  } else {
    return (
      <li className="task-list-item" key={`${data.title}-${index}`}>
        <input type="checkbox" id="" className="task-list-item-checkbox" />
        {/* Intentional space to mimic rendered HTML */}
        <> {data.title}</>
        {data.children ? buildParentList(data.children) : <></>}
      </li>
    )
  }
}

const buildParentList = (data: TasklistTestData[]) => {
  return (
    <>
      {/* The parent wrapper should be `ListWithTasks` as long as there is a tasklistitem in the list. */}
      {data.some(({type}) => type === 'tasklistitem') ? (
        <ListWithTasks>{data.map(buildTasklistItem)}</ListWithTasks>
      ) : (
        <ul>{data.map(buildTasklistItem)}</ul>
      )}
    </>
  )
}

export const TaskListBuilder = ({list}: {list: TasklistTestData[]}) => {
  return <MarkdownBodyWrapper>{buildParentList(list)}</MarkdownBodyWrapper>
}
