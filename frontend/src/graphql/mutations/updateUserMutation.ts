import { gql } from 'urql'

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($data: UpdateUserInput!) {
    updateUser(data: $data) {
      id
      email
      name
      phoneNumber
      role
    }
  }
`
