import {ObservableArray, type IReadonlyObservableArray} from '../observables/observable'
import type {IService} from './services'
import {ServiceBase} from './services'

export interface IErrorService extends IService {
  getMessagesToDisplay: () => IReadonlyObservableArray<ErrorMessage>
  log: (error: Error, displayMessage?: string) => void
  removeMessageToDisplay: (id: string) => void
}

export class ErrorService extends ServiceBase implements IErrorService {
  public static override readonly serviceId = 'IErrorService'
  private readonly errorMessages = new ObservableArray<ErrorMessage>()

  public log = (error: Error, displayMessage?: string) => {
    if (displayMessage?.length) {
      const errorMessage: ErrorMessage = {id: getRandomId(), message: displayMessage}
      this.errorMessages.push(errorMessage)
    }

    // this was the recommended way of logging an error since we want to throw while making sure it never interrupts
    // execution. We need to throw uncaught so that it will get logged to sentry
    setTimeout(() => {
      throw error
    }, 5)
  }

  public removeMessageToDisplay = (id: string) => {
    this.errorMessages.value = this.errorMessages.value.filter(v => v.id !== id)
  }

  public getMessagesToDisplay = (): IReadonlyObservableArray<ErrorMessage> => {
    return this.errorMessages
  }
}

export interface ErrorMessage {
  id: string
  message: string
}

const getRandomId = (): string => {
  return (Math.random() * 1000000000000000000).toString()
}
