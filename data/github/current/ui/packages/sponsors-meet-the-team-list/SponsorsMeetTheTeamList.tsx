import {useState} from 'react'
import {DragAndDrop, type OnDropArgs} from '@github-ui/drag-and-drop'
import {SponsorsMeetTheTeamItem, type SponsorsListingFeaturedItem} from './SponsorsMeetTheTeamItem'

export interface SponsorsMeetTheTeamListProps {
  featuredItems: SponsorsListingFeaturedItem[]
}

export function SponsorsMeetTheTeamList({featuredItems}: SponsorsMeetTheTeamListProps) {
  const [items, setItems] = useState(featuredItems)
  const onDrop = ({dragMetadata, dropMetadata, isBefore}: OnDropArgs<string>) => {
    if (dragMetadata.id === dropMetadata?.id) return

    const dragItem = items.find(item => item.id === dragMetadata.id)
    if (!dragItem) return

    setItems(
      items.reduce((newItems, item) => {
        if (dragItem.id === item.id) return newItems

        if (item.id !== dropMetadata?.id) {
          newItems.push(item)
        } else if (isBefore) {
          newItems.push(dragItem, item)
        } else {
          newItems.push(item, dragItem)
        }

        return newItems
      }, [] as SponsorsListingFeaturedItem[]),
    )
  }

  return (
    <DragAndDrop
      items={items}
      onDrop={onDrop}
      aria-label="Drag and drop list."
      className="mb-4"
      renderOverlay={(item, index) => (
        <SponsorsMeetTheTeamItem item={item} index={index} key={item.featureableId} isDragOverlay />
      )}
    >
      {items.map((item, index) => (
        <SponsorsMeetTheTeamItem item={item} index={index} key={item.featureableId} />
      ))}
    </DragAndDrop>
  )
}
