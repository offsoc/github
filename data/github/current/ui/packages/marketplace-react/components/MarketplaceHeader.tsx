import styles from '../marketplace.module.css'
import {TextInput, Spinner} from '@primer/react'
import useColorModes from '@github-ui/react-core/use-color-modes'
import {SearchIcon} from '@primer/octicons-react'
import {useCallback, useMemo, useState} from 'react'
import {debounce} from '@github/mini-throttle'
import {useFilterContext} from '../contexts/FilterContext'

export default function MarketplaceHeader() {
  const {query, onQueryChange, loading} = useFilterContext()
  const headerImages = ['arrow', 'donut', 'models', 'semicircles', 'sparklesmall', 'sparklelarge', 'workflow']
  const [privateQuery, setPrivateQuery] = useState<string>(query)

  const colorMode = useColorModes()

  const colorModeAwareAssetDirectory = useMemo(() => {
    switch (colorMode.colorMode) {
      case 'night':
        return 'dark'
      case 'day':
      default:
        return 'light'
    }
  }, [colorMode])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetQuery = useCallback(
    debounce((newQuery: string) => {
      onQueryChange(newQuery)
    }, 400),
    [onQueryChange],
  )

  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPrivateQuery(event.target.value)
      debouncedSetQuery(event.target.value)
    },
    [debouncedSetQuery],
  )

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      const search = new URLSearchParams()
      search.set('query', privateQuery)
      location.replace(`/marketplace?${search.toString()}`)
    },
    [privateQuery],
  )

  return (
    <header
      className={`mb-2 border-bottom borderColor-default d-flex flex-items-start py-5 py-lg-4 position-relative overflow-hidden ${styles['header']}`}
    >
      <div className={`${styles['gradient']} ${styles['gradient-left']}`} />
      <div className={`${styles['gradient']} ${styles['gradient-right']}`} />
      <div className="container-xl width-full m-auto d-flex flex-items-center flex-column flex-lg-row-reverse flex-justify-between gap-4 px-3 pl-lg-4 pr-lg-5 pl-xl-3">
        <div className={`position-relative mb-4 mb-lg-0 user-select-none ${styles['image-wrapper']}`}>
          {headerImages.map(image => (
            <img
              key={image}
              src={`/images/modules/marketplace/header/${colorModeAwareAssetDirectory}/${image}.png`}
              srcSet={`/images/modules/marketplace/header/${colorModeAwareAssetDirectory}/${image}@2x.png 2x`}
              className={`position-absolute ${styles[image as keyof typeof styles]}`}
              alt=""
            />
          ))}
          <img
            src={`/images/modules/marketplace/header/${colorModeAwareAssetDirectory}/copilot.png`}
            srcSet={`/images/modules/marketplace/header/${colorModeAwareAssetDirectory}/copilot@2x.png 2x`}
            className={`m-lg-4 ${styles['copilot']}`}
            alt=""
          />
        </div>
        <div className={`text-center text-lg-left ${styles['header-content']}`}>
          <h1 className="lh-condensed text-wrap-balance">Enhance your workflow with extensions</h1>
          <p className="fgColor-muted f3">
            Tools from the community and partners to simplify tasks and automate processes
          </p>
          <form onSubmit={handleSubmit}>
            <TextInput
              block
              size="large"
              sx={{mt: 3}}
              leadingVisual={
                loading ? (
                  <div className="d-flex">
                    <Spinner size="small" />
                  </div>
                ) : (
                  SearchIcon
                )
              }
              aria-label="Search Marketplace"
              placeholder={'Search for Copilot extensions, apps, actions, and models'}
              className={`width-full ${styles['search-input']}`}
              value={privateQuery}
              onChange={handleQueryChange}
              data-testid="search-input"
            />
          </form>
        </div>
      </div>
    </header>
  )
}
