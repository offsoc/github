// Custom reverse function used to reverse the customerSelections array which somehow does not
// work with the inbuilt JS reverse function.
export const reverse = <T>(array: T[]): T[] => {
  const newArray: T[] = []
  for (let i = array.length - 1; i >= 0; i--) {
    if (array[i] !== undefined) {
      newArray.push(array[i]!)
    }
  }
  return newArray
}
