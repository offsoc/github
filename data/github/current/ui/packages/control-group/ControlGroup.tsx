import ControlGroupContainer from './components/ControlGroupContainer'
import Title from './components/Title'
import Description from './components/Description'
import Item from './components/Item'
import LinkItem from './components/LinkItem'
import {Button, InlineEdit, ToggleSwitch, Custom} from './components/Controls'

export const ControlGroup = Object.assign(ControlGroupContainer, {
  Item,
  LinkItem,
  Title,
  Description,
  Custom,
  ToggleSwitch,
  Button,
  InlineEdit,
})
