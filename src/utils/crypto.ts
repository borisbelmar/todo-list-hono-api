import * as scrypt from 'scrypt-js'

const N = 16384
const r = 8
const p = 1
const dkLen = 32

// Convertir string a Uint8Array
const stringToUint8Array = (str: string): Uint8Array => {
  return new TextEncoder().encode(str)
}

// Convertir Uint8Array a hex string
const uint8ArrayToHex = (arr: Uint8Array): string => {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const passwordBuffer = stringToUint8Array(password)
  const saltBuffer = stringToUint8Array(salt)

  const hash = await scrypt.scrypt(passwordBuffer, saltBuffer, N, r, p, dkLen)
  return uint8ArrayToHex(hash)
}

export const verifyPassword = async (password: string, hash: string, salt: string): Promise<boolean> => {
  const computedHash = await hashPassword(password, salt)
  return computedHash === hash
}
