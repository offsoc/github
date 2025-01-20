import {Image as ReactBrandImage, type ImageProps} from '@primer/react-brand'

export const Image = ({src, alt, loading = 'lazy', decoding = 'async', ...rest}: ImageProps) => {
  return <ReactBrandImage src={src} alt={alt} loading={loading} decoding={decoding} {...rest} />
}
