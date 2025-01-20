import {controller, target} from '@github/catalyst'

@controller
class PreviewAnnouncementButtonElement extends HTMLElement {
  @target button: HTMLButtonElement

  showPreview() {
    const inputElement =
      document.querySelector<HTMLInputElement>('#custom_message_input_value') ||
      document.querySelector<HTMLTextAreaElement>('#custom_message_input_value')
    const message = inputElement!.value
    document.querySelector<HTMLInputElement>('#announcement_preview_value')!.value = message

    const userDismissibleCheckbox = document.querySelector<HTMLInputElement>('#custom_messages_user_dismissible_value')
    document.querySelector<HTMLInputElement>('#announcement_preview_user_dismissible')!.value =
      userDismissibleCheckbox!.checked.toString()
    this.button.form!.submit()
  }
}
