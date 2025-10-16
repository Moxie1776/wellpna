import { gql } from 'urql'

export const GET_VERIFICATION_CODE_QUERY = gql`
  query GetVerificationCode($email: String!) {
    getVerificationCode(email: $email)
  }
`
