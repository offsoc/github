/**
 * Fakes out webpack to think we're making a Worker in webpack-worker.
 */
export class FakeWorker {
  constructor(public url: URL) {}
}
