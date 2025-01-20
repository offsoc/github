import {getEnv} from '@github-ui/client-env'

export const useLocale = () => {
  return getEnv().locale
}
