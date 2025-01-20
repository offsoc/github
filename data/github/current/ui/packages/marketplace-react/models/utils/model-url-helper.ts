import type {Model} from '../../types'

export class ModelUrlHelper {
  static playgroundSuffix = 'playground'
  static codeSuffix = 'code'
  static jsonSuffix = 'json'
  static chatSuffix = 'chat'

  static modelUrl(model: Model) {
    return `/marketplace/models/${model.registry}/${model.name}`
  }

  static playgroundUrl(model: Model) {
    return `${ModelUrlHelper.modelUrl(model)}/${ModelUrlHelper.playgroundSuffix}`
  }

  static playgroundCodeUrl(model: Model) {
    return `${ModelUrlHelper.playgroundUrl(model)}/${ModelUrlHelper.codeSuffix}`
  }

  static playgroundJsonUrl(model: Model) {
    return `${ModelUrlHelper.playgroundUrl(model)}/${ModelUrlHelper.jsonSuffix}`
  }
}
