import { z } from 'zod'

const zodVersion = z.core.version.major

export const zodEmail = zodVersion === 4 ? z.email() : z.string().email()
