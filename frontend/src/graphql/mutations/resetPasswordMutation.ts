import { gql } from 'urql'

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($data: ResetPasswordInput!) {
    resetPassword(data: $data) {
      token
      user {
        id
        email
        name
      }
    }
  }
`
