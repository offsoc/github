import {ProgressBar} from '@primer/react'
import {DotFillIcon} from '@primer/octicons-react'

export interface BreakdownCardProps {
  title: string
  stat: string
  delimiter?: string
  breakdown: number[]
  legend: string[]
}

export function BreakdownCard({title, stat, breakdown, legend, ...props}: BreakdownCardProps) {
  const [this_app, other_apps] = breakdown
  const [this_app_label, other_apps_label] = legend

  return (
    <div className="border rounded-2 p-3 d-flex flex-column flex-1 gap-1" {...props}>
      <p className="h5 m-0">{title}</p>
      <p className="f2 m-0">{stat}</p>
      <ProgressBar aria-valuenow={100}>
        <ProgressBar.Item progress={this_app} className="bgColor-success-emphasis" />
        <ProgressBar.Item progress={other_apps} className="bgColor-accent-emphasis" />
      </ProgressBar>
      <div className="gap-1 d-flex">
        <div>
          <DotFillIcon size={16} className="fgColor-success" />
          <span className="f6 text-bold">{this_app_label}</span>
          <span className="f6 fgColor-muted ml-1">{this_app}%</span>
        </div>
        <div>
          <DotFillIcon size={16} className="fgColor-accent" />
          <span className="f6 text-bold">{other_apps_label}</span>
          <span className="f6 fgColor-muted ml-1">{other_apps}%</span>
        </div>
      </div>
    </div>
  )
}
