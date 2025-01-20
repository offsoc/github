import {ArrowSwitchIcon} from '@primer/octicons-react'
import {Button} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'
import React, {useState} from 'react'

import type {OnDropArgs} from '../utils/types'
import {DragAndDrop} from './DragAndDrop'
import {MoveModalTrigger as MoveModalTriggerComponent} from './MoveModalTrigger'
import styles from './MoveModalTrigger.stories.module.css'

const meta: Meta<typeof MoveModalTriggerComponent> = {
  title: 'Utilities/DragAndDrop',
  component: DragAndDrop,
}

type Story = StoryObj<typeof MoveModalTriggerComponent>

const containerStyle = {
  borderBottom: '1px solid grey',
  display: 'flex',
}

const itemStyles = {
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'min-content 1fr min-content',
  gap: '12px',
  padding: '12px',
  width: '100%',
}

const initializedItems = [
  {id: '1', title: 'In progress'},
  {id: '2', title: 'To do'},
  {id: '3', title: 'Done'},
]
const Color = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'cyan']

const ColoredCircle = ({id}: {id: number}) => (
  <div
    style={{
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: Color[id % Color.length],
    }}
  />
)

export const MoveModalTrigger: Story = {
  render: () =>
    React.createElement(() => {
      const [items, setItems] = useState(initializedItems)
      const onDrop = ({dragMetadata, dropMetadata, isBefore}: OnDropArgs<string>) => {
        if (dragMetadata.id === dropMetadata?.id) {
          return
        }
        const dragItem = items.find(item => item.id === dragMetadata.id)
        if (dragItem) {
          setItems(
            items.reduce(
              (newItems, item) => {
                if (dragItem.id === item.id) {
                  return newItems
                }
                if (item.id !== dropMetadata?.id) {
                  newItems.push(item)
                } else if (isBefore) {
                  newItems.push(dragItem, item)
                } else {
                  newItems.push(item, dragItem)
                }
                return newItems
              },
              [] as typeof items,
            ),
          )
        }
      }

      return (
        <DragAndDrop
          items={items}
          onDrop={onDrop}
          aria-label="Drag and drop list."
          renderOverlay={(item, index) => (
            <DragAndDrop.Item
              isDragOverlay
              index={index}
              id={item.id}
              key={item.id}
              title={item.title}
              containerStyle={containerStyle}
              style={itemStyles}
            >
              <div className={styles.Box_0}>
                <ColoredCircle id={Number(item.id)} />
                {item.title}
              </div>
              <MoveModalTriggerComponent
                Component={Button}
                icon={ArrowSwitchIcon}
                variant="invisible"
                aria-label={`move ${item.title} advanced`}
              />
            </DragAndDrop.Item>
          )}
        >
          {items.map((item, index) => (
            <DragAndDrop.Item
              index={index}
              id={item.id}
              key={item.id}
              title={item.title}
              containerStyle={containerStyle}
              style={itemStyles}
            >
              <div className={styles.Box_0}>
                <ColoredCircle id={Number(item.id)} />
                {item.title}
              </div>
              <MoveModalTriggerComponent
                Component={Button}
                icon={ArrowSwitchIcon}
                variant="invisible"
                aria-label={`move ${item.title} advanced`}
              />
            </DragAndDrop.Item>
          ))}
        </DragAndDrop>
      )
    }),
}

export default meta
