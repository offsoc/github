import {marked} from 'marked'

/**
 * Uses a JS Markdown rendering library to render basic HTML, then enriches it with dotcom
 * classes.
 *
 * Should only be used for testing - the output is guarunteed NOT to be exactly the same as
 * the dotcom output.
 */
export const renderMarkdown = (markdown: string) => {
  const rawHtml = marked.parse(markdown)
  const container = document.createElement('div')
  container.innerHTML = rawHtml
  const taskBoxes = container.querySelectorAll<HTMLInputElement>('ul > li > input[type=checkbox]')
  for (const taskBox of taskBoxes) {
    taskBox.disabled = true
    taskBox.classList.add('task-list-item-checkbox')
    taskBox.parentElement?.classList.add('task-list-item')
    taskBox.parentElement?.parentElement?.classList.add('contains-task-list')
  }
  return container.innerHTML
}
