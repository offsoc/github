import type {PropsWithChildren} from 'react'

export const MarkdownBodyWrapper = ({children}: PropsWithChildren) => <div className="markdown-body">{children}</div>

// Task lists have the `contains-task-list` class whenever there are immediate children that are tasks.
export const ListWithTasks = ({children}: PropsWithChildren) => <ul className="contains-task-list">{children}</ul>

/*
 Task items have a checkbox input as the first child and the `task-list-item` class.
 There is always space between the checkbox and the text.
*/
export const TaskItem = ({children}: PropsWithChildren) => (
  <li className="task-list-item">
    <input type="checkbox" id="" className="task-list-item-checkbox" />
    {/* Intentional space to mimic rendered HTML */}
    <> {children}</>
  </li>
)
