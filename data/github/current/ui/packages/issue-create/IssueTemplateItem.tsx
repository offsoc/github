import {ActionList} from '@primer/react'
import {ShieldIcon, LinkExternalIcon, ArrowRightIcon} from '@primer/octicons-react'
import {LABELS} from './constants/labels'
import {noop} from '@github-ui/noop'
import {BLANK_ISSUE} from './utils/model'
import {newTemplateAbsolutePath} from './utils/urls'
import {useIssueCreateDataContext} from './contexts/IssueCreateDataContext'
import styles from './IssueTemplateItem.module.css'

type IssueTemplateItemProps = {
  id: string
  onTemplateSelected: () => void
  name: string
  link: string | null | undefined
  about?: string | null
  externalLink?: boolean
  securityPolicy?: boolean
  trailingIcon?: JSX.Element
}

export const BlankIssueItem = ({
  onTemplateSelected,
}: Pick<IssueTemplateItemProps, 'onTemplateSelected'>): JSX.Element => {
  const {repositoryAbsolutePath} = useIssueCreateDataContext()

  return (
    <IssueTemplateItem
      id="default-blank"
      onTemplateSelected={onTemplateSelected}
      name={LABELS.blankIssueName}
      about={LABELS.blankIssueDescription}
      link={newTemplateAbsolutePath({repositoryAbsolutePath, fileName: BLANK_ISSUE})}
    />
  )
}

export const IssueTemplateItem = ({
  id,
  onTemplateSelected,
  name,
  about,
  link,
  externalLink,
  trailingIcon,
}: IssueTemplateItemProps): JSX.Element => {
  // If it's not an external link, then don't default to the tab behaviour and let our custom React handle it.
  const wrappedOnClick = (e: React.MouseEvent) => {
    if (!externalLink) {
      e.preventDefault()
      e.stopPropagation()
    }

    onTemplateSelected()
  }

  return (
    <ActionList.LinkItem
      key={id}
      href={link ?? '#'}
      target={externalLink ? '_blank' : undefined}
      onClick={wrappedOnClick}
      className={`${styles.templateItemContainer} py-2`}
    >
      <span className={styles.actionListTitle}>{name}</span>
      <ActionList.Description
        variant="block"
        sx={{
          mb: '2px', // slight adjustment to balance the larger font sizes
        }}
      >
        {about}
      </ActionList.Description>
      <ActionList.TrailingVisual>{trailingIcon ?? <ArrowRightIcon />}</ActionList.TrailingVisual>
    </ActionList.LinkItem>
  )
}

type LinkTemplateItemProps = Omit<IssueTemplateItemProps, 'onTemplateSelected'>

export const SecurityPolicyItem = ({link}: Omit<LinkTemplateItemProps, 'name' | 'id'>): JSX.Element => {
  return (
    <ExternalLinkTemplateItem
      id="default-security-policy"
      link={link}
      name={LABELS.securityPolicyName}
      about={LABELS.securityPolicyDescription}
      securityPolicy={true}
    />
  )
}

export const ExternalLinkTemplateItem = ({
  id,
  name,
  about,
  link,
  securityPolicy,
}: LinkTemplateItemProps): JSX.Element => {
  if (!link) {
    return <></>
  }

  return (
    <IssueTemplateItem
      id={id}
      onTemplateSelected={noop}
      name={name}
      link={link}
      about={about}
      externalLink={true}
      trailingIcon={securityPolicy ? <ShieldIcon /> : <LinkExternalIcon />}
    />
  )
}
