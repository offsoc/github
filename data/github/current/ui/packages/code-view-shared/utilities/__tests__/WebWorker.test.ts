import {MainThreadWorker} from '../web-worker'

describe('MainThreadWorker', () => {
  it('works correctly', async () => {
    const jobMock = jest.fn()
    const onMessageMock = jest.fn()

    const worker = new MainThreadWorker(jobMock)

    // does not break if posted before adding listener
    worker.postMessage('test')
    worker.onmessage = onMessageMock

    await worker.postMessage('test')
    expect(jobMock).toHaveBeenCalledWith({data: 'test'})
    expect(onMessageMock).toHaveBeenCalledTimes(1)

    // Does not perform the job or post if terminated
    worker.terminate()
    jobMock.mockClear()
    onMessageMock.mockClear()

    await worker.postMessage('test')
    expect(jobMock).not.toHaveBeenCalled()
    expect(onMessageMock).not.toHaveBeenCalled()
  })
})
