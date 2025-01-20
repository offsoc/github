interface Props {
  width?: number | string
}

export function SkeletonText({width, ...props}: Props) {
  return (
    <div style={{width}} className="Skeleton Skeleton--text" {...props}>
      &nbsp;
    </div>
  )
}
