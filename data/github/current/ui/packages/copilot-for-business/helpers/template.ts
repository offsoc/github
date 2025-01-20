const INTERPOLATED_VAR_RE = /{([^}]+)}/g

export function buildTemplate(endpoint: string) {
  return (config: Record<string, string>): string => {
    return endpoint.replaceAll(INTERPOLATED_VAR_RE, function (_match: string, key: string) {
      return config[key] ?? ''
    })
  }
}
