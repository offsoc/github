// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function debounce<F extends (...args: any[]) => any>(
  fn: F,
  ms: number,
): (...args: Parameters<F>) => Promise<ReturnType<F>> {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<F>): Promise<ReturnType<F>> {
    clearTimeout(timer as ReturnType<typeof setTimeout>)

    return new Promise(resolve => {
      timer = setTimeout(() => resolve(fn(...args)), ms)
    })
  }
}
