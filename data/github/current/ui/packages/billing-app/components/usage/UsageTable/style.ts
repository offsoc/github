import {boxStyle, flexFill} from '../../../utils/style'

export const containerStyle = {
  ...boxStyle,
  p: 0,
}

export const tableStyle = {
  width: '100%',
  textAlign: 'left',
  borderCollapse: 'separate',
}

export const borderTop = {
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'border.default',
}

export const theadStyle = {
  position: 'sticky',
  top: 0,
  bg: 'canvas.subtle',
  fontWeight: 'bold',
}

export const trStyle = {
  display: 'flex',
}

export const cellStyle = {p: 3}

export const identifierCell = {
  ...cellStyle,
  ...flexFill,
}

export const fixedWidthCell = {
  ...cellStyle,
  textAlign: 'right',
  '@media (min-width: 600px)': {
    width: '18%',
  },
  '@media (max-width: 599px)': {
    width: '100%',
  },
}

export const expandableIconWidth = '48px'
