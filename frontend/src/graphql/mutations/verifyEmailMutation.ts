import { gql } from 'urql'

export const VERIFY_EMAIL_MUTATION = gql`
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
