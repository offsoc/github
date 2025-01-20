export const {
  NODE_ENV = 'production',
  APP_ENV = 'production',
  ENABLE_PROFILING = 'FALSE',
  IS_STANDALONE = 'FALSE',
} = process.env

export const isProfilingEnabled = ENABLE_PROFILING === 'TRUE'
export const isDevNodeEnv = NODE_ENV === 'development'
export const publicPath = '/assets'
