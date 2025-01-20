import {useAppPayload} from '@github-ui/react-core/use-app-payload'

export type AppPayloadWithStafftoolsFlag = {is_stafftools?: boolean}

export const useIsStafftools = () => useAppPayload<AppPayloadWithStafftoolsFlag>()?.is_stafftools ?? false
