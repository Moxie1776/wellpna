import { gql } from 'urql'

export const SIGN_UP_MUTATION = gql`
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
