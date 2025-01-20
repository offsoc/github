export type SelectType = 'single' | 'multiple' | 'instant' | 'action'

export type SelectTypeProps =
  | {
      selectType: 'single'
      /*
       * radioGroupName: The name used to identify the group of radios this Action List Item is
       * associate with.This is required for single select type.
       * For more details on Radio Group: https://primer.style/components/radio-group/react/alpha
       */
      radioGroupName: string
    }
  | {
      selectType: 'multiple'
      radioGroupName?: never
    }
  | {
      selectType: 'instant'
      radioGroupName?: never
    }
  | {
      selectType: 'action'
      radioGroupName?: never
    }
