import {readFileSync} from 'fs'

const serviceNameRegex = /^\s\s(\w+):/
let services: string[]

function getAvailableServices() {
  if (services) {
    return services
  }

  const file = readFileSync('../../../config/service-mappings.yaml', 'utf8')
  const lines = file.split('\n')
  services = []

  for (const line of lines) {
    if (line.startsWith('review_groups:')) {
      break
    }

    const serviceName = line.match(serviceNameRegex)

    if (serviceName && serviceName[1] && serviceName[1] !== 'github') {
      services.push(serviceName[1])
    }
  }

  return services
}

export function listMatchingServices(input: string) {
  const allServices = getAvailableServices()

  if (!input) {
    return allServices
  }

  return allServices.filter(service => service.startsWith(input))
}
