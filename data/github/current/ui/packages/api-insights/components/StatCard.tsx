export interface StatCardProps {
  title: string
  stat: string
  delimiter?: string
  description: string
}

export function StatCard({title, stat, description, delimiter, ...props}: StatCardProps) {
  return (
    <div className="border rounded-2 p-3 d-flex flex-column flex-1 gap-1" {...props}>
      <p className="h5 m-0">{title}</p>
      <p className="f2 m-0">
        {stat}
        {delimiter && <span className="f3"> / {delimiter}</span>}
      </p>
      <p className="m-0 fgColor-muted f6">{description}</p>
    </div>
  )
}
