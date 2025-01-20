type CustomPropertyGroupKey = `repo.props.${string}`
export type GroupKey =
  | 'none'
  | 'tool'
  | 'severity'
  | 'repo'
  | 'repo.visibility'
  | 'team'
  | 'topic'
  | 'dependabot.advisory'
  | CustomPropertyGroupKey

export type Severity = 'critical' | 'high' | 'medium' | 'low'
