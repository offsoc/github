interface Props {
  children: React.ReactNode
  'data-hpc'?: boolean
}

export default function Layout(props: Props) {
  const {children, 'data-hpc': dataHpc} = props

  return <div data-hpc={dataHpc ? true : undefined}>{children}</div>
}
