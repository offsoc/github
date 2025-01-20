import {controller, target, targets} from '@github/catalyst'
import {debounce} from '@github/mini-throttle/decorators'
import {sendHydroEvent} from '../../../assets/modules/github/hydro-tracking'

@controller
export class FileTreeElement extends HTMLElement {
  @target fileTreeNode: HTMLElement
  @targets fileTreeNodes: HTMLElement[]

  instrumentToggleFileTree(toggleButton: HTMLButtonElement): void {
    toggleButton.setAttribute('data-hydro-client-context', JSON.stringify(this.defaultHydroContextAttributes()))
    sendHydroEvent(toggleButton)
  }

  instrumentSelectFile(event: Event): void {
    const fileNode = event.currentTarget
    if (!(fileNode instanceof HTMLElement)) return

    fileNode.setAttribute('data-hydro-client-context', JSON.stringify(this.defaultHydroContextAttributes()))
    sendHydroEvent(fileNode)
  }

  @debounce(300)
  instrumentPathFilterChange(event: CustomEvent): void {
    const input = event.detail.inputField
    if (!(input instanceof HTMLInputElement)) return

    const hydroContextAttributes = {
      ...this.defaultHydroContextAttributes(),
      query: input.value,
    }
    input.setAttribute('data-hydro-client-context', JSON.stringify(hydroContextAttributes))

    sendHydroEvent(input)
  }

  private defaultHydroContextAttributes(): {tree_file_count: number} {
    return {tree_file_count: this.visibleFileTreeNodeCount()}
  }

  private visibleFileTreeNodeCount(): number {
    return this.fileTreeNodes.filter(node => !node.hidden).length
  }
}
