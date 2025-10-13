import { gql } from 'urql'

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($name: String, $phoneNumber: String) {
    updateUser(name: $name, phoneNumber: $phoneNumber) {
      id
      email
      name
      phoneNumber
      role
    }
  }
`
