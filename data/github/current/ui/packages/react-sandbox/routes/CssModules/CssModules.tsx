import cssStyles from './CssModules.module.css'

export function CssModules() {
  return (
    <div data-hpc>
      <p className={cssStyles['css-module-style']}>
        HTML <span className={cssStyles['p']}>`p`</span> tag styled from `./CssModules.module.css`
      </p>
      <p className={cssStyles['css-module-style']}>Primer `Text` component styled from `./CssModules.module.css`</p>
      <p className={cssStyles['css-module-style']}>
        HTML <span className="css-module-global-class-name">`p`</span> tag styled from global style in
        `./CssModules.module.css`
      </p>
    </div>
  )
}
