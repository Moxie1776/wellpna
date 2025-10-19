import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `Byte` scalar type represents byte value as a Buffer */
  Bytes: { input: any; output: any; }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** A custom decimal scalar */
  Decimal: { input: any; output: any; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type Casing = {
  __typename?: 'Casing';
  api?: Maybe<Scalars['String']['output']>;
  bottomDepth?: Maybe<Scalars['Int']['output']>;
  casingEnum?: Maybe<CasingEnum>;
  casingEnumId?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  topDepth?: Maybe<Scalars['Int']['output']>;
  well?: Maybe<Well>;
};

export type CasingEnum = {
  __typename?: 'CasingEnum';
  casings?: Maybe<Array<Casing>>;
  externalDiameter?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  internalDiameter?: Maybe<Scalars['Float']['output']>;
  tocDepth?: Maybe<Scalars['Int']['output']>;
};

export type Geology = {
  __typename?: 'Geology';
  id?: Maybe<Scalars['ID']['output']>;
  wells?: Maybe<Array<Well>>;
};

export type Location = {
  __typename?: 'Location';
  api?: Maybe<Scalars['String']['output']>;
  county?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  well?: Maybe<Well>;
};

export type MechanicalIsolation = {
  __typename?: 'MechanicalIsolation';
  api?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  well?: Maybe<Well>;
};

export type Mutation = {
  __typename?: 'Mutation';
  cleanupTestUsers?: Maybe<Scalars['Int']['output']>;
  debugVerifyUser?: Maybe<Scalars['Boolean']['output']>;
  requestPasswordReset?: Maybe<Scalars['Boolean']['output']>;
  resetPassword?: Maybe<AuthPayload>;
  sendVerificationEmail?: Maybe<Scalars['Boolean']['output']>;
  signIn?: Maybe<AuthPayload>;
  signUp?: Maybe<AuthPayload>;
  updateUser?: Maybe<User>;
  updateUserRole?: Maybe<User>;
  verifyEmail?: Maybe<AuthPayload>;
};


export type MutationCleanupTestUsersArgs = {
  pattern?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDebugVerifyUserArgs = {
  email: Scalars['String']['input'];
};


export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  data: ResetPasswordInput;
};


export type MutationSendVerificationEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationSignInArgs = {
  data: SignInInput;
};


export type MutationSignUpArgs = {
  data: SignUpInput;
};


export type MutationUpdateUserArgs = {
  data?: InputMaybe<UpdateUserInput>;
};


export type MutationUpdateUserRoleArgs = {
  data: UpdateUserRoleInput;
};


export type MutationVerifyEmailArgs = {
  data: VerifyEmailInput;
};

export type Operator = {
  __typename?: 'Operator';
  id?: Maybe<Scalars['ID']['output']>;
  operatorEnum?: Maybe<Scalars['String']['output']>;
  operatorEnumId?: Maybe<OperatorEnum>;
  operatorNo?: Maybe<Scalars['String']['output']>;
  stateAbbr?: Maybe<Scalars['String']['output']>;
  userOperators?: Maybe<Array<OperatorUser>>;
  wells?: Maybe<Array<Well>>;
};

export type OperatorEnum = {
  __typename?: 'OperatorEnum';
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  operators?: Maybe<Array<Operator>>;
};

export type OperatorUser = {
  __typename?: 'OperatorUser';
  id?: Maybe<Scalars['ID']['output']>;
  operator?: Maybe<Operator>;
  user?: Maybe<User>;
};

export type Perforation = {
  __typename?: 'Perforation';
  api?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  well?: Maybe<Well>;
};

export type PlugSchedule = {
  __typename?: 'PlugSchedule';
  api?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  well?: Maybe<Well>;
};

export type Query = {
  __typename?: 'Query';
  debugStatus?: Maybe<Scalars['String']['output']>;
  getPasswordResetCode?: Maybe<Scalars['String']['output']>;
  getVerificationCode?: Maybe<Scalars['String']['output']>;
  health?: Maybe<Scalars['String']['output']>;
  me?: Maybe<User>;
  signIn?: Maybe<AuthPayload>;
  users?: Maybe<Array<User>>;
};


export type QueryGetPasswordResetCodeArgs = {
  email: Scalars['String']['input'];
};


export type QueryGetVerificationCodeArgs = {
  email: Scalars['String']['input'];
};


export type QuerySignInArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  code: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type Rods = {
  __typename?: 'Rods';
  api?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  well?: Maybe<Well>;
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type Tubing = {
  __typename?: 'Tubing';
  api?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  well?: Maybe<Well>;
};

export type UpdateUserInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserRoleInput = {
  role: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  operatorUsers?: Maybe<Array<OperatorUser>>;
  password?: Maybe<Scalars['String']['output']>;
  passwordResetToken?: Maybe<Scalars['String']['output']>;
  passwordResetTokenExpiresAt?: Maybe<Scalars['DateTime']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  registeredAt?: Maybe<Scalars['DateTime']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  roleId?: Maybe<UserRole>;
  validatedAt?: Maybe<Scalars['DateTime']['output']>;
  verificationCode?: Maybe<Scalars['String']['output']>;
  verificationCodeExpiresAt?: Maybe<Scalars['DateTime']['output']>;
};

export type UserRole = {
  __typename?: 'UserRole';
  role?: Maybe<Scalars['String']['output']>;
  users?: Maybe<Array<User>>;
};

export type VerifyEmailInput = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type Well = {
  __typename?: 'Well';
  api?: Maybe<Scalars['String']['output']>;
  casings?: Maybe<Array<Casing>>;
  geology?: Maybe<Geology>;
  location?: Maybe<Location>;
  mechanicalIsolation?: Maybe<Array<MechanicalIsolation>>;
  operator?: Maybe<Operator>;
  perforations?: Maybe<Array<Perforation>>;
  plugSchedules?: Maybe<Array<PlugSchedule>>;
  rods?: Maybe<Array<Rods>>;
  tubings?: Maybe<Array<Tubing>>;
  wellInfo?: Maybe<WellInfo>;
};

export type WellInfo = {
  __typename?: 'WellInfo';
  api?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  well?: Maybe<Well>;
};

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type RequestPasswordResetMutation = { __typename?: 'Mutation', requestPasswordReset?: boolean | null };

export type ResetPasswordMutationVariables = Exact<{
  data: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword?: { __typename?: 'AuthPayload', token?: string | null, user?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null } | null } | null };

export type SendVerificationEmailMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type SendVerificationEmailMutation = { __typename?: 'Mutation', sendVerificationEmail?: boolean | null };

export type SignInMutationVariables = Exact<{
  data: SignInInput;
}>;


export type SignInMutation = { __typename?: 'Mutation', signIn?: { __typename?: 'AuthPayload', token?: string | null, user?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null, phoneNumber?: string | null, role?: string | null } | null } | null };

export type SignUpMutationVariables = Exact<{
  data: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp?: { __typename?: 'AuthPayload', token?: string | null, user?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null, phoneNumber?: string | null } | null } | null };

export type UpdateUserMutationVariables = Exact<{
  data: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null, phoneNumber?: string | null, role?: string | null } | null };

export type UpdateUserRoleMutationVariables = Exact<{
  data: UpdateUserRoleInput;
}>;


export type UpdateUserRoleMutation = { __typename?: 'Mutation', updateUserRole?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null, phoneNumber?: string | null, role?: string | null } | null };

export type VerifyEmailMutationVariables = Exact<{
  data: VerifyEmailInput;
}>;


export type VerifyEmailMutation = { __typename?: 'Mutation', verifyEmail?: { __typename?: 'AuthPayload', token?: string | null, user?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null } | null } | null };

export type GetVerificationCodeQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type GetVerificationCodeQuery = { __typename?: 'Query', getVerificationCode?: string | null };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users?: Array<{ __typename?: 'User', id?: string | null, email?: string | null, name?: string | null, phoneNumber?: string | null, role?: string | null, registeredAt?: any | null }> | null };


export const RequestPasswordResetDocument = gql`
    mutation RequestPasswordReset($email: String!) {
  requestPasswordReset(email: $email)
}
    `;

export function useRequestPasswordResetMutation() {
  return Urql.useMutation<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>(RequestPasswordResetDocument);
};
export const ResetPasswordDocument = gql`
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
    `;

export function useResetPasswordMutation() {
  return Urql.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument);
};
export const SendVerificationEmailDocument = gql`
    mutation SendVerificationEmail($email: String!) {
  sendVerificationEmail(email: $email)
}
    `;

export function useSendVerificationEmailMutation() {
  return Urql.useMutation<SendVerificationEmailMutation, SendVerificationEmailMutationVariables>(SendVerificationEmailDocument);
};
export const SignInDocument = gql`
    mutation SignIn($data: SignInInput!) {
  signIn(data: $data) {
    token
    user {
      id
      email
      name
      phoneNumber
      role
    }
  }
}
    `;

export function useSignInMutation() {
  return Urql.useMutation<SignInMutation, SignInMutationVariables>(SignInDocument);
};
export const SignUpDocument = gql`
    mutation SignUp($data: SignUpInput!) {
  signUp(data: $data) {
    token
    user {
      id
      email
      name
      phoneNumber
    }
  }
}
    `;

export function useSignUpMutation() {
  return Urql.useMutation<SignUpMutation, SignUpMutationVariables>(SignUpDocument);
};
export const UpdateUserDocument = gql`
    mutation UpdateUser($data: UpdateUserInput!) {
  updateUser(data: $data) {
    id
    email
    name
    phoneNumber
    role
  }
}
    `;

export function useUpdateUserMutation() {
  return Urql.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument);
};
export const UpdateUserRoleDocument = gql`
    mutation UpdateUserRole($data: UpdateUserRoleInput!) {
  updateUserRole(data: $data) {
    id
    email
    name
    phoneNumber
    role
  }
}
    `;

export function useUpdateUserRoleMutation() {
  return Urql.useMutation<UpdateUserRoleMutation, UpdateUserRoleMutationVariables>(UpdateUserRoleDocument);
};
export const VerifyEmailDocument = gql`
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
    `;

export function useVerifyEmailMutation() {
  return Urql.useMutation<VerifyEmailMutation, VerifyEmailMutationVariables>(VerifyEmailDocument);
};
export const GetVerificationCodeDocument = gql`
    query GetVerificationCode($email: String!) {
  getVerificationCode(email: $email)
}
    `;

export function useGetVerificationCodeQuery(options: Omit<Urql.UseQueryArgs<GetVerificationCodeQueryVariables>, 'query'>) {
  return Urql.useQuery<GetVerificationCodeQuery, GetVerificationCodeQueryVariables>({ query: GetVerificationCodeDocument, ...options });
};
export const UsersDocument = gql`
    query Users {
  users {
    id
    email
    name
    phoneNumber
    role
    registeredAt
  }
}
    `;

export function useUsersQuery(options?: Omit<Urql.UseQueryArgs<UsersQueryVariables>, 'query'>) {
  return Urql.useQuery<UsersQuery, UsersQueryVariables>({ query: UsersDocument, ...options });
};