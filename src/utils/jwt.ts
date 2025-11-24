import { SignJWT, jwtVerify } from 'jose'

const getSecretKey = (jwtSecret: string): Uint8Array => {
  return new TextEncoder().encode(jwtSecret)
}

export const generateToken = async (userId: string, jwtSecret: string): Promise<string> => {
  const secret = getSecretKey(jwtSecret)

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

export const verifyToken = async (token: string, jwtSecret: string): Promise<string | null> => {
  try {
    const secret = getSecretKey(jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    return payload.sub || null
  } catch {
    return null
  }
}
