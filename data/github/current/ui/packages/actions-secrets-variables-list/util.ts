// eslint-disable-next-line import/no-nodejs-modules
import {Buffer} from 'buffer'

export async function encryptString(itemValue: string, publicKey: string) {
  const {seal} = await import('../../../app/assets/modules/github/tweetsodium')
  const itemBytes = Buffer.from(itemValue)
  const publicKeyBytes = Buffer.from(publicKey, 'base64')
  const encryptedBytes = seal(itemBytes, publicKeyBytes)
  const encryptedValue = Buffer.from(encryptedBytes).toString('base64')

  return encryptedValue
}
