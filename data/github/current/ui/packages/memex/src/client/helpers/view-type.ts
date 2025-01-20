import {type Icon, ProjectIcon, ProjectRoadmapIcon, TableIcon} from '@primer/octicons-react'

import {ViewTypeParam} from '../api/view/contracts'
import {Resources} from '../strings'
import {joinOxford} from './join-oxford'

export const ViewType = {
  Table: 'table',
  Board: 'board',
  List: 'list',
  Roadmap: 'roadmap',
} as const
export type ViewType = ObjectValues<typeof ViewType>

const viewTypeParamToViewTypeMap: Record<ViewTypeParam, ViewType> = {
  [ViewTypeParam.Board]: ViewType.Board,
  [ViewTypeParam.Table]: ViewType.Table,
  [ViewTypeParam.List]: ViewType.List,
  [ViewTypeParam.Roadmap]: ViewType.Roadmap,
}

const viewParamToViewTypeParamMap: Record<ViewType, ViewTypeParam> = {
  [ViewType.Board]: ViewTypeParam.Board,
  [ViewType.Table]: ViewTypeParam.Table,
  [ViewType.List]: ViewTypeParam.List,
  [ViewType.Roadmap]: ViewTypeParam.Roadmap,
}

const viewTypeIcons: {[key in ViewTypeParam]: Icon} = {
  [ViewTypeParam.Board]: ProjectIcon,
  [ViewTypeParam.Table]: TableIcon,
  [ViewTypeParam.List]: ProjectIcon,
  [ViewTypeParam.Roadmap]: ProjectRoadmapIcon,
}

export class EnumValueError<T extends object, V> extends Error {
  constructor(name: string, value: V, enums: T) {
    super(Resources.invalidFieldValues({name, value: `${value}`, fields: joinOxford(Object.keys(enums))}))
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'EnumValueError'
  }
}

export function getViewTypeFromViewTypeParam(viewTypeParam: ViewTypeParam) {
  const viewType = viewTypeParamToViewTypeMap[viewTypeParam]
  if (!viewType) {
    throw new EnumValueError('ViewTypeParam', viewTypeParam, ViewTypeParam)
  }
  return viewType
}

export function getViewTypeParamFromViewType(viewType: ViewType) {
  const viewTypeParam = viewParamToViewTypeParamMap[viewType]
  if (!viewTypeParam) {
    throw new EnumValueError('ViewType', viewType, ViewType)
  }
  return viewTypeParam
}

export function getViewIcons(viewTypeParam: ViewTypeParam) {
  const viewIcon = viewTypeIcons[viewTypeParam]
  if (!viewIcon) {
    throw new EnumValueError('getViewIcons', viewTypeParam, viewTypeIcons)
  }
  return viewIcon
}
