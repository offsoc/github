export default class SelectionChangeEvent extends Event {
  constructor(
    public count: number,
    public useQuery = false,
  ) {
    super('selection-change', {bubbles: true})
  }
}
