import {CuratedImagesPointerTable} from './CuratedImagesPointerTable'
import {CuratedImagesTable} from './CuratedImagesTable'
import {tableGapStyle} from '../utils/style'
import type {ImageDefinition} from '../types'
import {Box} from '@primer/react'
import {ImsBlankslate} from './ImsBlankstate'
import {Constants} from '../constants/constants'

interface ICuratedImagesPageProps {
  imageDefinitionPointers: ImageDefinition[]
  imageDefinitions: ImageDefinition[]
  imsStafftoolsPath: string
  newCuratedImagePath: string
  newCuratedPointerPath: string
}

export function CuratedImagesPage(props: ICuratedImagesPageProps) {
  return (
    <Box sx={tableGapStyle}>
      {props.imageDefinitionPointers.length > 0 ? (
        <CuratedImagesPointerTable
          pointers={props.imageDefinitionPointers}
          newCuratedPointerPath={props.newCuratedPointerPath}
        />
      ) : (
        <ImsBlankslate
          title={Constants.pointerBlankslateTitle}
          description={Constants.blankslateDescription}
          primaryAction={Constants.createPointer}
        />
      )}
      {props.imageDefinitions.length > 0 ? (
        <CuratedImagesTable
          imageDefinitions={props.imageDefinitions}
          imsStafftoolsPath={props.imsStafftoolsPath}
          newCuratedImagePath={props.newCuratedImagePath}
        />
      ) : (
        <ImsBlankslate
          title={Constants.curatedImagesPointerTableBlankslateTitle}
          description={Constants.blankslateDescription}
          primaryAction={Constants.createCuratedImages}
        />
      )}
    </Box>
  )
}
