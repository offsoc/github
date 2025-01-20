import {generateColor} from '../../common/generateColor'

export const MockLabel = (index: number) => ({
  id: index.toString(),
  nameHTML: `label ${index}`,
  name: `label ${index}`,
  description: `description ${index}`,
  color: generateColor(index),
})

export const mockLabelsResolvers = (itemsCount: number = 3, selectedCount: number = 1) => ({
  Repository() {
    return {
      labelCount: {
        totalCount: itemsCount,
      },
      labels: {
        edges: Array.from({length: itemsCount}, (_, index) => {
          return {
            node: {
              id: `node-id-repo-${index}`,
              nameHTML: `repo label ${index}`,
              name: `repo label ${index}`,
              description: `repo label description ${index}`,
              color: generateColor(index),
            },
          }
        }),
      },
      selectedLabels: {
        nodes: Array.from({length: selectedCount}, (_, index) => {
          return {
            id: `node-id-selected-${index}`,
            nameHTML: `selected label ${index}`,
            name: `selected label ${index}`,
            description: `selected label description ${index}`,
            color: generateColor(index),
          }
        }),
      },
    }
  },
  Issue() {
    return {
      labels: {
        nodes: Array.from({length: selectedCount}, (_, index) => {
          return {
            id: `node-id-selected-${index}`,
            nameHTML: `selected label ${index}`,
            name: `selected label ${index}`,
            description: `selected label description ${index}`,
            color: generateColor(index),
          }
        }),
      },
    }
  },
})
