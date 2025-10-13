import { gql } from 'urql'

export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($userId: String!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      email
      name
      phoneNumber
      role
    }
  }
`
