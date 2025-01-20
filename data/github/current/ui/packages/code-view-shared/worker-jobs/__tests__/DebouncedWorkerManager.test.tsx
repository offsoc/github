import {DebouncedWorkerManager} from '../debounced-worker-manager'

jest.useFakeTimers()
describe('DebouncedWorkerManager', () => {
  it('waits a delay before sending work to worker', async () => {
    const worker = {
      postMessage: jest.fn(),
      onmessage: jest.fn(),
    }
    const manager = new DebouncedWorkerManager<string, string>(worker as unknown as Worker)
    manager.onResponse = jest.fn()
    expect(manager.idle()).toBe(true)

    manager.post('a')
    expect(manager.idle()).toBe(true)

    manager.post('b')
    expect(manager.idle()).toBe(true)

    jest.runAllTimers()
    expect(manager.idle()).toBe(false)
    expect(manager.onResponse).not.toHaveBeenCalled()

    worker.onmessage({data: 'Yes'})
    expect(manager.onResponse).toHaveBeenCalledWith('Yes')
  })

  it('does not send work while worker is busy, send only latest when idle', async () => {
    const worker = {
      postMessage: jest.fn(),
      onmessage: jest.fn(),
    }
    const manager = new DebouncedWorkerManager<string, string>(worker as unknown as Worker)
    manager.onResponse = jest.fn()

    manager.post('a')
    jest.runAllTimers()
    expect(manager.idle()).toBe(false)
    expect(worker.postMessage).toHaveBeenCalledWith('a')

    manager.post('b')
    manager.post('c')
    manager.post('d')

    worker.onmessage({data: 'One'})
    expect(manager.idle()).toBe(false)
    expect(manager.onResponse).toHaveBeenCalledWith('One')

    worker.onmessage({data: 'Two'})
    expect(worker.postMessage).toHaveBeenCalledWith('d')
    expect(manager.idle()).toBe(true)
    expect(manager.onResponse).toHaveBeenLastCalledWith('Two')
  })

  it('does not use debounce when override condition is met', async () => {
    const worker = {
      postMessage: jest.fn(),
      onmessage: jest.fn(),
    }
    const manager = new DebouncedWorkerManager<string, string>(worker as unknown as Worker, 200, () => true)
    manager.onResponse = jest.fn()
    expect(manager.idle()).toBe(true)

    manager.post('a')
    expect(manager.idle()).toBe(false)

    worker.onmessage({data: 'Yes'})
    expect(manager.onResponse).toHaveBeenCalledWith('Yes')
  })
})
