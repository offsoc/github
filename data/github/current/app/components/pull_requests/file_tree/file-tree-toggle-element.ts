import {attr, controller, target} from '@github/catalyst'

@controller
export class FileTreeToggleElement extends HTMLElement {
  @attr url = ''
  @attr csrf = ''
  @target showFileTreeButton: HTMLElement
  @target hideFileTreeButton: HTMLElement

  toggleFileTree(event: Event): void {
    this.showFileTreeButton.toggleAttribute('hidden')
    this.hideFileTreeButton.toggleAttribute('hidden')

    const toggleButton = event.currentTarget as HTMLButtonElement
    this.dispatchEvent(new CustomEvent('toggle-sidebar', {detail: {toggleButton}}))

    if (this.url.length > 0) {
      const fileTreeVisible = toggleButton.getAttribute('data-prefer-file-tree-visible')!
      this.updateFileTreeVisibilityPreference(fileTreeVisible)
    }
  }

  async updateFileTreeVisibilityPreference(fileTreeVisible: string): Promise<void> {
    const data = new FormData()
    data.set('file_tree_visible', fileTreeVisible)
    try {
      await fetch(this.url, {
        method: 'PUT',
        body: data,
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Scoped-CSRF-Token': `${this.csrf}`,
        },
      })
    } catch {
      // Ignore network errors
    }
  }
}
