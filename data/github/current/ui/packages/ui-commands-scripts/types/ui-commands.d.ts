type UICommand = {
  name: string
  description: string
  defaultBinding?: string
}

type UIService = {
  id: string
  name: string
  commandIds: string[]
}

type UICommandsCollection = {
  services: UIService[]
  commands: UICommand[]
}

type WebpackLogger = {
  log: (message: string) => void
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}
