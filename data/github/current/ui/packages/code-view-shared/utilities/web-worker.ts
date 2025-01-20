type WorkerEventListener<Data> = (response: {data: Data}) => void

interface AbstractWorker<TRequest, TResponse> {
  onmessage?: WorkerEventListener<TResponse>
  postMessage(request: TRequest): void
  terminate(): void
}

/**
 * WebWorker is an abstraction that exposes similar interface as a Service Worker.
 * However, besides the path it also requires a callback, same function as the one run in the worker thread.
 * This callback is used as a fallback if worker cannot be created.
 */
export class WebWorker<TRequest, TResponse> implements AbstractWorker<TRequest, TResponse> {
  worker: Worker | MainThreadWorker<TRequest, TResponse>

  set onmessage(listener: WorkerEventListener<TResponse>) {
    this.worker.onmessage = listener
  }

  constructor(path: string, job: (request: {data: TRequest}) => TResponse) {
    try {
      this.worker = new Worker(path)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Web workers are not available. Please enable web workers to benefit from the improved performance.')
      this.worker = new MainThreadWorker(job)
    }
  }

  postMessage(request: TRequest) {
    this.worker.postMessage(request)
  }

  terminate() {
    this.worker.terminate()
  }
}

export class MainThreadWorker<TRequest, TResponse> implements AbstractWorker<TRequest, TResponse> {
  private terminated = false

  onmessage: WorkerEventListener<TResponse> | undefined

  constructor(private job: (request: {data: TRequest}) => TResponse) {}

  async postMessage(request: TRequest) {
    if (this.terminated) {
      return
    }
    const response = {data: this.job({data: request})}
    this.onmessage?.(response)
  }

  terminate() {
    this.terminated = true
  }
}
