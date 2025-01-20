import type {PageView} from '../../client/api/view/contracts'
import {deepCopy} from './utils'

export class ViewsCollection {
  private views: Array<PageView>

  constructor(views: Array<PageView> = []) {
    this.views = deepCopy(views)
  }

  public all() {
    return this.views
  }

  public add(view: PageView) {
    this.views.push(view)
  }

  public update(updatedView: PageView) {
    this.views = this.views.map(view => (view.number === updatedView.number ? updatedView : view))
  }

  public delete(number: number) {
    this.views = this.views.filter(view => view.number !== number)
  }
}
