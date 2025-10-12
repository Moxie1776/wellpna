import { builder } from '../../builder'
import { User } from './User'

export const AuthPayload = builder.objectRef<{ token: string; user: any }>(
  'AuthPayload',
)

builder.objectType(AuthPayload, {
  fields: (t) => ({
    token: t.exposeString('token'),
    user: t.expose('user', { type: User }),
  }),
})
