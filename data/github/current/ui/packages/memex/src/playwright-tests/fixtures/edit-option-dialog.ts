import type {ColorName} from '@github-ui/use-named-color'

import {BasePageViewWithMemexApp} from './base-page-view'

/**
 * Represents the "Edit option" dialog that appears when managing single-select options.
 * This exists outside the `ProjectSettingsPage` because it can be opened from other places
 * as well, such as the "Edit option" menu item on columns in board view.
 */
export class EditOptionDialog extends BasePageViewWithMemexApp {
  DIALOG = this.page.getByRole('dialog', {name: 'Edit option'})

  NAME_INPUT = this.DIALOG.getByRole('textbox', {name: 'Label text'})
  COLOR_RADIO_GROUP = this.DIALOG.getByRole('group', {name: 'Color'})
  DESCRIPTION_INPUT = this.DIALOG.getByRole('textbox', {name: 'Description'})
  SAVE_BUTTON = this.DIALOG.getByRole('button', {name: 'Save'})
  CANCEL_BUTTON = this.DIALOG.getByRole('button', {name: 'Cancel'})

  public getColorRadio(color: ColorName) {
    const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()
    // We actually want the label element since that's what can be clicked and manipulated; the radio is hidden
    return this.COLOR_RADIO_GROUP.getByTestId(`color-picker-option-${capitalizedColor}`)
  }
}
