import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {PrivateNetworkConsts} from '../constants/private-network-consts'
import {NetworkConfigurationConsts} from '../constants/network-configuration-consts'
import type {ComputeService} from '../classes/network-configuration'

export enum PrivateNetworkValidationResult {
  None,
  Success,
  MissingNetwork,
  NetworkResourceInUse,
  UnsupportedResourceLocation,
  DuplicateLocation,
}

export enum NameValidationResult {
  None,
  Success,
  InvalidName,
  DisplayNameInUse,
}

export function hasNameValidationError(result: NameValidationResult): boolean {
  return result !== NameValidationResult.Success && result !== NameValidationResult.None
}

export function getNameValidationError(result: NameValidationResult): string {
  switch (result) {
    case NameValidationResult.InvalidName:
      return PrivateNetworkConsts.invalidNameError
    case NameValidationResult.DisplayNameInUse:
      return NetworkConfigurationConsts.errorDisplayNameInUse
    default:
      return ''
  }
}

export function hasPrivateNetworkValidationError(result: PrivateNetworkValidationResult): boolean {
  return result !== PrivateNetworkValidationResult.Success && result !== PrivateNetworkValidationResult.None
}

export function getPrivateNetworkValidationError(
  result: PrivateNetworkValidationResult,
  privateNetworkLocation?: string,
): string {
  switch (result) {
    case PrivateNetworkValidationResult.MissingNetwork:
      return PrivateNetworkConsts.azurePrivateNetworkingNotEmptyError
    case PrivateNetworkValidationResult.NetworkResourceInUse:
      return NetworkConfigurationConsts.errorNetworkResourceInUse
    case PrivateNetworkValidationResult.UnsupportedResourceLocation:
      // private network shouldn't be null here, but safe-navigate just in case
      return NetworkConfigurationConsts.errorUnsupportedResourceLocation(privateNetworkLocation ?? 'unknown')
    case PrivateNetworkValidationResult.DuplicateLocation:
      return NetworkConfigurationConsts.errorDuplicateLocation(privateNetworkLocation ?? 'unknown')
    default:
      return ''
  }
}

// Validates the name. If the url isn't passed, the validation will only check the name format.
export async function validateNetworkConfigurationName(name: string, findUrl?: string): Promise<NameValidationResult> {
  const regex = /^[a-zA-Z0-9._-]{1,100}$/
  if (!regex.test(name.trim())) {
    return NameValidationResult.InvalidName
  }

  if (!findUrl) {
    return NameValidationResult.Success
  }

  // Check if the name is already in use
  try {
    const result = await verifiedFetchJSON(`${findUrl}?name=${name}`, {
      method: 'GET',
    })
    if (result.ok) {
      const data = await result.json()
      if (data.networkConfigurations.length > 0) {
        return NameValidationResult.DisplayNameInUse
      } else {
        return NameValidationResult.Success
      }
    } else {
      // Checking validation failed, so we don't know if the name is in use or not. We'll
      // assume it's not and let the submit fail if it is.
      return NameValidationResult.Success
    }
  } catch (e: unknown) {
    // Checking validation failed, so we don't know if the name is in use or not. We'll
    // assume it's not and let the submit fail if it is.
    return NameValidationResult.Success
  }
}

export interface ICreateOrUpdateSuccess {
  success: true
  link: string
}
export interface ICreateOrUpdateFailure {
  success: false
  code: string
  message: string
}
export type CreateOrUpdateResult = ICreateOrUpdateSuccess | ICreateOrUpdateFailure
export interface IUpdatePayload {
  configurationId: string
  privateNetworkIds?: string[]
  name?: string
  computeService: ComputeService
}
export interface ICreatePayload {
  privateNetworkIds: string[]
  computeService: ComputeService
  name: string
}

export async function createOrUpdateNetworkConfiguration(
  createOrUpdateUrl: string,
  listNetworkConfigurationsUrl: string,
  payload: ICreatePayload | IUpdatePayload,
): Promise<CreateOrUpdateResult> {
  try {
    const result = await verifiedFetchJSON(createOrUpdateUrl, {
      method: 'POST',
      body: payload,
    })
    const data = await result.json()
    if (result.ok) {
      // Location should always be included, but fallback just in case
      const link = result.headers.get('Location') ?? listNetworkConfigurationsUrl
      return {
        success: true,
        link,
      }
    } else {
      return {
        success: false,
        code: data.error.code,
        message: data.error.message ?? JSON.stringify(data.error),
      }
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : JSON.stringify(e)
    return {
      success: false,
      code: 'unknown',
      message,
    }
  }
}
