import { gql, TypedDocumentNode } from '@urql/core'

import { AuthResponse } from '../types'

interface SignInInput {
  email: string
  password: string
}

interface SignInMutationResponse {
  signIn: AuthResponse
}

export const SIGN_IN_MUTATION: TypedDocumentNode<
  SignInMutationResponse,
  { data: SignInInput }
> = gql`
  mutation SignIn($data: SignInInput!) {
    signIn(data: $data) {
      token
      user {
        id
        email
        name
        phoneNumber
        role
      }
    }
  }
`
