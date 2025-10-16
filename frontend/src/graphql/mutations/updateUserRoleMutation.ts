import { gql } from 'urql'

export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($data: UpdateUserRoleInput!) {
    updateUserRole(data: $data) {
      id
      email
      name
      phoneNumber
      role
    }
  }
`
