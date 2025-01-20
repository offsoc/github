import {useEffect, useState} from 'react'

type ParamsProps = {
  ref_cta: string | null
  ref_loc: string | null
  ref_page: string | null
  variant: string | null
}

export function useParams(): ParamsProps {
  const [params, setParams] = useState<ParamsProps>({
    ref_cta: null,
    ref_loc: null,
    ref_page: null,
    variant: null,
  })

  useEffect(() => {
    const url = new URLSearchParams(window.location.href)
    const ref_cta = url.get('ref_cta')
    const ref_loc = url.get('ref_loc')
    const ref_page = url.get('ref_page')
    const variant = url.get('variant') ?? 'control'

    setParams({
      ref_cta,
      ref_loc,
      ref_page,
      variant,
    })
  }, [])

  return params
}
