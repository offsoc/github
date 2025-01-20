import {useElementSizes} from './common/use-element-sizes'
import {useRootElement} from './use-root-element'

export const useSiteHeaderHeight = () => {
  const {clientHeight: documentSize} = useElementSizes(document.body)

  const rootElement = useRootElement()
  const applicationContainerElement = document.querySelector<HTMLElement>('.application-main')
  const {clientHeight: memexSize} = useElementSizes(applicationContainerElement ?? rootElement ?? null)

  return documentSize && memexSize ? documentSize - memexSize : undefined
}
