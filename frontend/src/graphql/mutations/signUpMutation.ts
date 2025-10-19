import { gql, TypedDocumentNode } from '@urql/core'

import { AuthResponse } from '../types'

interface SignUpInput {
  email: string
  password: string
  name: string
  phoneNumber: string
}

interface SignUpMutationResponse {
  signUp: AuthResponse
}

export const SIGN_UP_MUTATION: TypedDocumentNode<
  SignUpMutationResponse,
  { data: SignUpInput }
> = gql`
  mutation SignUp($data: SignUpInput!) {
    signUp(data: $data) {
      token
      user {
        id
        email
        name
        phoneNumber
      }
    }
  }
`
