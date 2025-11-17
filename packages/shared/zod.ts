import { z } from 'zod'

export const zodEmail = z.string().email()
