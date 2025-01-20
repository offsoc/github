import {verifiedFetch} from '@github-ui/verified-fetch'
import type {FileType} from '@primer/react/drafts'
import {useCallback} from 'react'

// 204 No Content
type S3ResponseData = Record<string, unknown>

// 201 Created
type EnterpriseResponseData = {
  id: number
  href: string
}

type UploadResponseData = EnterpriseResponseData | S3ResponseData

type S3UploadPolicy = {
  asset_upload_url: string
  asset_upload_authenticity_token: string
  upload_authenticity_token: string
  upload_url: string
  form: Record<string, string>
  header: Record<string, string>
  same_origin: boolean
  asset: {
    id: number
    href: string
    name: string
  }
}

type EnterpriseUploadPolicy = {
  upload_authenticity_token: string
  upload_url: string
  form: {[key: string]: string}
  header: Record<string, string>
  same_origin: boolean
  asset: {
    name: string
  }
}

type UploadPolicyData = S3UploadPolicy | EnterpriseUploadPolicy

/**
 * File types that are acceptable in any context.
 * Source: `Storage::Uplodable::CONTENT_TYPES`
 */
const REPOLESS_ACCEPTED_FILE_TYPES: FileType[] = ['.svg', '.gif', '.jpg', '.jpeg', '.png', '.mov', '.mp4', '.webm']

/**
 * File types that are only acceptable when there is a target repo to upload to.
 * Source: `ApplicationRecord::Domain::Assets::RepositoryFile::set_content_types`
 */
const REPO_ACCEPTED_FILE_TYPES: FileType[] = [
  ...REPOLESS_ACCEPTED_FILE_TYPES,
  '.pdf',
  '.docx',
  '.pptx',
  '.xlsx',
  '.odt',
  '.fodt',
  '.ods',
  '.fods',
  '.odp',
  '.fodp',
  '.odg',
  '.fodg',
  '.odf',
  '.csv',
  '.xls',
  '.zip',
  '.gz',
  '.tgz',
  '.patch',
  '.txt',
  '.log',
  '.md',
  '.json',
  '.jsonc',
  '.cpuprofile',
  '.dmp',
]

async function getPolicy(file: File, repositoryId?: string, projectId?: string) {
  const formData = new FormData()
  const {name, size, type} = file
  if (repositoryId) formData.append('repository_id', repositoryId)
  if (projectId) {
    formData.append('upload_container_type', 'project')
    formData.append('upload_container_id', projectId)
  }
  formData.append('name', name)
  formData.append('size', size.toString())
  formData.append('content_type', type)

  const response = await verifiedFetch('/upload/policies/assets', {body: formData, method: 'POST'})

  return response
}

async function uploadFileToStorage(policy: UploadPolicyData, file: File) {
  const {upload_authenticity_token, upload_url, header, form, same_origin} = policy
  const uploadFormData = new FormData()

  if (same_origin) {
    // eslint-disable-next-line github/authenticity-token
    uploadFormData.append('authenticity_token', upload_authenticity_token)
  }

  for (const key in form) {
    uploadFormData.append(key, form[key]!)
  }
  uploadFormData.append('file', file)

  const uploadResponse = await fetch(upload_url, {
    headers: {...header},
    method: 'post',
    body: uploadFormData,
  })
  return uploadResponse
}

async function markUploadComplete(policy: UploadPolicyData, uploadResponse: Response) {
  // @ts-expect-error `asset_upload_url` is not defined on policy type
  const assetUploadUrl = typeof policy.asset_upload_url === 'string' ? policy.asset_upload_url : null
  const token =
    // @ts-expect-error `asset_upload_authenticity_token` is not defined on policy type
    typeof policy.asset_upload_authenticity_token == 'string' ? policy.asset_upload_authenticity_token : null

  if (assetUploadUrl && token) {
    const putForm = new FormData()
    // eslint-disable-next-line github/authenticity-token
    putForm.append('authenticity_token', token)

    const putResponse = await fetch(assetUploadUrl, {
      method: 'PUT',
      body: putForm,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    return putResponse
  }
  return uploadResponse
}

async function uploadFile(file: File, repositoryId?: string, projectId?: string) {
  const policyResponse = await getPolicy(file, repositoryId, projectId)
  if (!policyResponse.ok) throw new Error('Upload failed')

  const policy = (await policyResponse.json()) as UploadPolicyData
  const uploadResponse = await uploadFileToStorage(policy, file)
  if (!uploadResponse.ok) throw new Error('Upload failed')

  const putResponse = await markUploadComplete(policy, uploadResponse)
  if (!putResponse.ok) throw new Error('Upload failed')

  const putResponseJson = (await putResponse.json()) as UploadResponseData
  const {href: url} = putResponseJson
  if (typeof url !== 'string') throw new Error('Upload failed')

  return {
    url,
    file,
  }
}

export function acceptedFileTypes(hasRepository: boolean) {
  return hasRepository ? REPO_ACCEPTED_FILE_TYPES : REPOLESS_ACCEPTED_FILE_TYPES
}

export function useUploadFile(repositoryId?: string, projectId?: string) {
  return useCallback(
    async (file: File) => {
      return uploadFile(file, repositoryId, projectId)
    },
    [repositoryId, projectId],
  )
}
