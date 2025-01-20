import {isFeatureEnabled} from '@github-ui/feature-flags'

export const applyRemoveChildPatch = () => {
  if (isFeatureEnabled('remove_child_patch')) {
    if (typeof Node === 'function' && Node.prototype) {
      const originalRemoveChild = Node.prototype.removeChild
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      Node.prototype.removeChild = function (child) {
        try {
          return originalRemoveChild.apply(this, [child])
        } catch (e) {
          if (e instanceof Error && e.stack?.includes('react-lib')) {
            return child
          }
          throw e
        }
      }
    }
  }
}
