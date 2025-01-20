import {Banner} from '@primer/react/drafts'

interface Props {
  numDeleted: number
}

export function DeletedReposBanner({numDeleted}: Props) {
  const numDeletedReposWord = numDeleted === 1 ? 'repository' : 'repositories'

  const content = `${numDeleted} ${numDeletedReposWord} used in training has since been deleted.`

  return (
    <Banner
      description={
        <>
          <Banner.Title style={{display: 'none'}}>{content}</Banner.Title>
          <span>{content}</span>
        </>
      }
      variant="info"
    />
  )
}
