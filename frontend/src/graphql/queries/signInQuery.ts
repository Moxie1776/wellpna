import { gql } from '@urql/core'

export const SIGN_IN_QUERY = gql`
  query SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
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
