import { gql } from 'urql'

export const USERS_QUERY = gql`
  query Users {
    users {
      id
      email
      name
      phoneNumber
      role
      registeredAt
      validatedAt
      operatorUsers {
        operator {
          operatorEnum
        }
      }
    }
  }
`
