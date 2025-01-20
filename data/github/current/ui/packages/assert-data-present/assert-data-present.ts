export const errorMessage = 'Failed to load page data.'

export function assertDataPresent<T>(data: T): asserts data is NonNullable<T> {
  if (data === undefined || data === null) {
    throw new Error(errorMessage)
  }
}
