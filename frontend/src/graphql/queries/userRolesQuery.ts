import { gql } from 'urql'

export const USER_ROLES_QUERY = gql`
  query UserRoles {
    userRoles {
      role
    }
  }
`

export default USER_ROLES_QUERY
