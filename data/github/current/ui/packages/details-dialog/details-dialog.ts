import {fire} from 'delegated-events'

type Options = {
  content: DocumentFragment | Promise<DocumentFragment> | Node
  dialogClass?: string
  detailsClass?: string
  labelledBy?: string | null
  label?: string | null
  errorMessage?: string | null
}

// Open the site-wide Details Dialog element.
export async function dialog(options: Options): Promise<HTMLElement> {
  const dialogTemplate = document.querySelector<HTMLTemplateElement>('#site-details-dialog')!
  const clonedDetails = dialogTemplate.content.cloneNode(true) as Element
  const details = clonedDetails.querySelector<HTMLElement>('details')!
  const detailsDialog = details.querySelector<HTMLElement>('details-dialog')!
  const spinner = details.querySelector<HTMLElement>('.js-details-dialog-spinner')!
  if (options.detailsClass) details.classList.add(...options.detailsClass.split(' '))
  if (options.dialogClass) detailsDialog.classList.add(...options.dialogClass.split(' '))

  if (options.label) {
    detailsDialog.setAttribute('aria-label', options.label)
  } else if (options.labelledBy) {
    detailsDialog.setAttribute('aria-labelledby', options.labelledBy)
  }

  document.body.append(clonedDetails)
  try {
    const content = await options.content
    spinner.remove()
    detailsDialog.prepend(content)
  } catch (error) {
    spinner.remove()
    // create a span with the error message
    const errorSpan = document.createElement('span')
    errorSpan.textContent = options.errorMessage || "Couldn't load the content"
    errorSpan.classList.add('my-6')
    errorSpan.classList.add('mx-4')
    detailsDialog.prepend(errorSpan)
  }

  details.addEventListener('toggle', () => {
    if (details.hasAttribute('open')) return
    fire(detailsDialog, 'dialog:remove')
    details.remove()
  })

  return detailsDialog
}
