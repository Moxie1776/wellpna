import { gql, TypedDocumentNode } from '@urql/core'

// AuthResponse intentionally not needed here;
// signUp returns a scalar confirm str

interface SignUpInput {
  email: string
  password: string
  name: string
  phoneNumber: string
}

interface SignUpMutationResponse {
  signUp: string
}

export const SIGN_UP_MUTATION: TypedDocumentNode<
  SignUpMutationResponse,
  { data: SignUpInput }
> = gql`
  mutation SignUp($data: SignUpInput!) {
    signUp(data: $data)
  }
`
