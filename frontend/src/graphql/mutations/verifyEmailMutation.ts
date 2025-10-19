import { gql, TypedDocumentNode } from '@urql/core'

import { AuthResponse } from '../types'

interface VerifyEmailInput {
  email: string
  code: string
}

interface VerifyEmailMutationResponse {
  verifyEmail: AuthResponse
}

export const VERIFY_EMAIL_MUTATION: TypedDocumentNode<
  VerifyEmailMutationResponse,
  { data: VerifyEmailInput }
> = gql`
  mutation VerifyEmail($data: VerifyEmailInput!) {
    verifyEmail(data: $data) {
      token
      user {
        id
        email
        name
      }
    }
  }
`
