import { gql } from 'urql'

export const SIGN_UP_MUTATION = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $name: String!
    $phoneNumber: String!
  ) {
    signUp(
      email: $email
      password: $password
      name: $name
      phoneNumber: $phoneNumber
    ) {
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
