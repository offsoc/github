/**
 * Given a size and a color, return a boxShadow that will render
 * such that is looks like a border
 * @param param0
 * @returns
 */
export function boxShadowBorder({size, color}: {size: string | 0; color: string}): string {
  // uses the box shadow spread properties to create a border
  return `0 0 0 ${size} ${color}`
}
