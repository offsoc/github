export default class SettingSelectionChangeEvent extends Event {
  constructor() {
    super('setting-selection-change', {bubbles: true})
  }
}
