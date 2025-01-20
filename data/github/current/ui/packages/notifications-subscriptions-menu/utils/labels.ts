import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'

const MAX_CHARS = 30
const MAX_CHARS_ONE_LABEL = 25

// Return the labels name corrected to show in the SelectPanel button
export const labelsCounterText = (labels: ItemInput[]) => {
  const firstTwoLabels = labelsText(labels, 2)
  if (labels.length >= 2) {
    if (labels.length === 2) {
      return twoLabelsText(labels)
    }

    const firstThreeLabels = labelsText(labels, 3)
    if (firstThreeLabels.length > MAX_CHARS) {
      return `${firstTwoLabels.slice(0, 30)}... +${labels.length - 2} more`
    } else {
      const more = labels.length > 3 ? ` +${labels.length - 3} more` : ''
      return `${firstThreeLabels}${more}`
    }
  }

  if (labels.length === 1) {
    const text = labels[0]?.text || ''
    return text.length > MAX_CHARS ? `${text.slice(0, 30)}...` : text
  } else {
    return 'All'
  }
}

const twoLabelsText = (labels: ItemInput[]) => {
  const firstLabel = labels[0]?.text || ''
  const firstTwoLabels = labelsText(labels, 2)
  if (firstTwoLabels.length > MAX_CHARS) {
    return firstLabel.length > MAX_CHARS_ONE_LABEL
      ? `${firstLabel.slice(0, 25)}... +1 more`
      : `${firstTwoLabels.slice(0, 30)}...`
  } else {
    return firstTwoLabels
  }
}

const labelsText = (labels: ItemInput[], noLabels: number) => {
  return labels
    .slice(0, noLabels)
    .map(label => label.text)
    .join(', ')
}
