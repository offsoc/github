// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import TrackingBlockAPIComponent from './tracking-block-api'
import {TrackingBlockElement} from './tracking-block-element'
import {controller} from '@github/catalyst'

on('tracking-block:add-tasklist', '.js-comment, .markdown-body', event => {
  // Signal that this event was handled.
  event.preventDefault()

  const {resolve, reject} = event.detail
  const comment = event.target as HTMLElement
  const form = comment.querySelector<HTMLFormElement>('.js-comment-update')
  const apiComponent = new TrackingBlockAPIComponent(comment)
  apiComponent.init()

  // Focus the omnibar for the newest tasklist block
  TrackingBlockElement.refocusOmnibarIndex = comment.querySelectorAll('tracking-block').length

  apiComponent
    .addTasklistBlock({
      operation: 'add_tasklist_block',
      formId: form?.id || '',
    })
    // eslint-disable-next-line github/no-then
    .then(resolve, reject)
})

@controller
export class TasklistBlockAddTasklistElement extends HTMLElement {}
