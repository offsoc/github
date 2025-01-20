import type {Memex} from '../../client/api/memex/contracts'

export const DefaultMemex: Memex = {
  id: 1,
  number: 1,
  title: "My Team's Memex",
  public: false,
  closedAt: null,
  isTemplate: false,
}
export const EmptyMemex: Memex = {id: 100, number: 100, title: '', public: false, closedAt: null, isTemplate: false}
export const ReadonlyMemex: Memex = {id: 1, number: 1, title: '', public: true, closedAt: null, isTemplate: false}
export const DateMemex: Memex = {
  id: 1,
  number: 1,
  title: 'Schedule Planning',
  public: false,
  closedAt: null,
  isTemplate: false,
}

export const CustomTemplateMemex: Memex = {
  id: 1,
  number: 1,
  title: 'My Template',
  public: false,
  closedAt: null,
  isTemplate: true,
  templateId: 2,
}
