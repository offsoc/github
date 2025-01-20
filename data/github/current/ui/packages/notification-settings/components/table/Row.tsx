import type React from 'react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {Box, Heading, Text} from '@primer/react'

export interface RowProps {
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subtitle?: React.ComponentElement<any, any> | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action?: React.ComponentElement<any, any>
  separator?: boolean
  sx?: BetterSystemStyleObject
  labelId?: string
}

function Row(props: RowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        py: 3,
        mx: 3,
        borderColor: 'border.default',
        borderBottomWidth: props.separator === false ? 0 : 1,
        borderBottomStyle: 'solid',
        ...props.sx,
      }}
    >
      <div className={`mr-sm-0 ml-sm-0`}>
        <Heading as="h3" sx={{fontSize: 1, mb: 0}} id={props.labelId}>
          {props.title}
        </Heading>
        <Text sx={{color: 'fg.muted', m: 0}}>{props.subtitle}</Text>
        {props.action && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              mt: 2,
              mb: 1,
            }}
          >
            {props.action}
          </Box>
        )}
      </div>
    </Box>
  )
}

export default Row
