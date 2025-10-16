import { builder } from '../../builder'

export const User = builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    password: t.exposeString('password'),
    name: t.exposeString('name'),
    phoneNumber: t.exposeString('phoneNumber'),
    role: t.exposeString('role'),
    registeredAt: t.expose('registeredAt', { type: 'DateTime' }),
    validatedAt: t.expose('validatedAt', { type: 'DateTime', nullable: true }),
    verificationCode: t.exposeString('verificationCode', { nullable: true }),
    verificationCodeExpiresAt: t.expose('verificationCodeExpiresAt', {
      nullable: true,
      type: 'DateTime',
    }),
    passwordResetToken: t.exposeString('passwordResetToken', {
      nullable: true,
    }),
    passwordResetTokenExpiresAt: t.expose('passwordResetTokenExpiresAt', {
      nullable: true,
      type: 'DateTime',
    }),
    roleId: t.relation('roleId'),
    operatorUsers: t.relation('OperatorUser'),
  }),
})
