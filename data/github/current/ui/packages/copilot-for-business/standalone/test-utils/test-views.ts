import {screen, within, fireEvent} from '@testing-library/react'
import {View, type RoleQuery} from './helpers'

export class BulkRemoveModalTriggerBtn extends View {
  constructor() {
    super()

    this.container = screen.queryByRole('button', {name: 'Cancel team access'})
  }

  confirm() {
    this.container && fireEvent.click(this.container)
  }
}

export class ConfirmationModal extends View {
  cancelBtn: HTMLElement
  confirmBtn: HTMLElement

  constructor() {
    super()

    this.container = screen.getByRole('dialog', {name: /Cancel team(s)? access/i})
    this.cancelBtn = within(this.container).getByRole('button', {name: 'Cancel'})
    this.confirmBtn = within(this.container).getByRole('button', {name: /remove team(s)? access/i})
  }

  cancel() {
    fireEvent.click(this.cancelBtn)
  }

  confirm() {
    fireEvent.click(this.confirmBtn)
  }
}

export class SelectAllCheckbox extends View {
  constructor() {
    super()

    this.container = screen.getByRole('checkbox', {name: 'Select all members'})
  }

  confirm() {
    this.container && fireEvent.click(this.container)
  }
}

export class TableRowView extends View {
  checkbox: HTMLElement | null
  teamName: HTMLElement | null = null
  actionMenu: TableRowActionsView

  constructor() {
    super()

    this.container = this.parent.queryByRole('listitem')
    this.checkbox = this.findChild.queryByRole('checkbox')
    this.actionMenu = TableRowActionsView.get(this.container)
  }

  select() {
    this.checkbox && fireEvent.click(this.checkbox)
  }
}

// TODO test this: there is an error with a provider not rendering correctly for action menu?
export class TableRowActionsView extends View {
  menu: HTMLElement
  cancelAction: HTMLElement | null
  reAssignAction: HTMLElement | null

  constructor() {
    super()

    this.container = this.parent.queryByRole('button', {name: 'Open column options'})
    this.menu = this.parent.queryByRole('menu')
    this.cancelAction = this.findChild.queryByRole('menuitemradio', {name: 'Cancel seat'})
    this.reAssignAction = this.findChild.queryByRole('menuitemradio', {name: 'Re-assign team access'})
  }

  open() {
    this.container && fireEvent.click(this.container)
  }

  cancelSeat() {
    this.cancelAction && fireEvent.click(this.cancelAction)
  }

  reAssignSeat() {
    this.reAssignAction && fireEvent.click(this.reAssignAction)
  }
}

export class SearchView extends View {
  constructor() {
    super()
    this.container = screen.queryByPlaceholderText('Filter enterprise teams')
  }

  interactSearch(value: string) {
    this.container && fireEvent.change(this.container, {target: {value}})
  }
}

export class AddSeatsDialog extends View {
  override query = ['dialog', {name: 'Add enterprise teams to enable access to Copilot Business'}] as RoleQuery

  searchBar: SearchView
  selectableTable: HTMLElement | null
  cancelBtn: HTMLElement | null
  confirmBtn: HTMLElement | null
  priceInfo: HTMLElement | null

  constructor({container}: {container?: HTMLElement} = {}) {
    super()

    if (container) {
      this.container = container
    } else {
      this.container = screen.queryByRole.apply(this, this.query)
    }

    this.searchBar = SearchView.get()
    this.selectableTable = this.findChild.queryByRole('region', {name: 'Seats management table'})
    this.priceInfo = this.findChild.queryByRole('region', {name: 'New assignments estimated cost'})
    this.cancelBtn = this.findChild.queryByRole('button', {name: 'Cancel'})
    this.confirmBtn = this.findChild.queryByRole('button', {name: 'Add teams'})
  }

  cancel() {
    this.cancelBtn && fireEvent.click(this.cancelBtn)
  }

  confirm() {
    this.confirmBtn && fireEvent.click(this.confirmBtn)
  }
}
