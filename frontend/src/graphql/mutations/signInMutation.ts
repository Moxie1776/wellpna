import { gql } from 'urql'

export const SIGN_IN_MUTATION = gql`
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
