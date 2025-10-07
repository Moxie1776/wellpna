import { gql } from 'urql'

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($code: String!, $newPassword: String!) {
    resetPassword(code: $code, newPassword: $newPassword) {
      token
      user {
        id
        email
        name
      }
    }
  }
`
