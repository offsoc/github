import {
  type PageView,
  type PageViewCreateRequest,
  type PageViewCreateResponse,
  type PageViewDeleteRequest,
  type PageViewUpdateRequest,
  type PageViewUpdateResponse,
  ViewTypeParam,
} from '../../client/api/view/contracts'
import {MemexRefreshEvents} from '../data/memex-refresh-events'
import {delete_destroyView, post_createView, put_updateView} from '../msw-responders/views'
import {BaseController} from './base-controller'

export class ViewsController extends BaseController {
  // Offset to avoid conflicting with test fixtures.
  private nextViewId = 100

  public async create({view}: PageViewCreateRequest): Promise<PageViewCreateResponse> {
    const id = this.nextViewId++
    const now = new Date().toISOString()

    const newView: PageView = {
      id,
      number: id,
      name: view.name ?? `View ${id}`,
      filter: view.filter ?? '',
      layout: view.layout ?? ViewTypeParam.Table,
      groupBy: view.groupBy ?? [],
      verticalGroupBy: [],
      sortBy: view.sortBy ?? [],
      visibleFields:
        view.visibleFields ??
        this.db.columns
          .all()
          .filter(col => col.defaultColumn)
          .map(col => col.databaseId),
      priority: null,
      createdAt: now,
      updatedAt: now,
      aggregationSettings: view.aggregationSettings ?? {
        hideItemsCount: false,
        sum: [],
      },
      layoutSettings: view.layoutSettings ?? {},
      sliceBy: view.sliceBy ?? {},
      sliceValue: view.sliceValue ?? '',
    }
    this.db.views.add(newView)

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectViewCreate,
    })
    return {view: newView}
  }

  public async update({view, viewNumber}: PageViewUpdateRequest): Promise<PageViewUpdateResponse> {
    const now = new Date().toISOString()

    const updatedView: PageView = {
      id: viewNumber,
      number: viewNumber,
      priority: null,
      name: view.name ?? `View ${viewNumber}`,
      filter: view.filter ?? null,
      layout: view.layout ?? ViewTypeParam.Table,
      groupBy: view.groupBy ?? [],
      verticalGroupBy: view.verticalGroupBy ?? [],
      sortBy: view.sortBy ?? [],
      visibleFields: view.visibleFields ?? [],
      createdAt: view.createdAt ?? now,
      updatedAt: now,
      aggregationSettings: view.aggregationSettings,
      layoutSettings: view.layoutSettings ?? {},
      sliceBy: view.sliceBy ?? {},
      sliceValue: view.sliceValue ?? '',
    }

    this.db.views.update(updatedView)

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectViewUpdate,
    })

    return {view: updatedView}
  }

  public async delete({viewNumber}: PageViewDeleteRequest): Promise<void> {
    this.db.views.delete(viewNumber)
    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectViewDestroy,
    })
  }

  public override handlers = [
    post_createView(async body => {
      return this.create(body)
    }),
    put_updateView(async body => {
      return this.update(body)
    }),
    delete_destroyView(async body => {
      return this.delete(body)
    }),
  ]
}
