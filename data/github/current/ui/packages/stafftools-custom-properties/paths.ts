export const customPropertyDefinitionDetailsPath = ({org, propertyName}: {org: string; propertyName: string}) =>
  `/stafftools/users/${org}/organization_custom_properties/${propertyName}`

export const customPropertiesDefinitionListPath = ({org}: {org: string}) =>
  `/stafftools/users/${org}/organization_custom_properties`
