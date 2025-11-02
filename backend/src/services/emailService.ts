import nodemailer from 'nodemailer'

import logger from '../utils/logger'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      requireTLS: process.env.SMTP_TLS === 'true',
      debug: true,
      auth: process.env.SMTP_USERNAME
        ? {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    })
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@wellpna.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }

    await this.transporter.sendMail(mailOptions)
  }

  async sendVerificationEmail(
    email: string,
    verificationCode: string,
  ): Promise<void> {
    // In debug mode, don't actually send emails to avoid failures in tests
    if (process.env.NODE_ENV === 'debug') {
      logger.debug(
        `Sends verification email to ${email} with code ${verificationCode}`,
      )
      return
    }

    const subject = 'Verify Your Email - WellPNA'
    const html = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
      ">
        <h2>Welcome to WellPNA!</h2>
        <p>Please verify your email address by entering the following code:</p>
        <div style="
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
        ">
          ${verificationCode}
        </div>
        <p>This code will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `

    try {
      await this.sendEmail({ to: email, subject, html })
    } catch (error) {
      logger.error('Failed to send verification email:', error)
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetCode: string,
  ): Promise<void> {
    // In debug mode, don't actually send emails to avoid failures in tests
    if (process.env.NODE_ENV === 'debug') {
      logger.debug(
        `Would send password reset email to ${email} with code ${resetCode}`,
      )
      return
    }

    const subject = 'Reset Your Password - WellPNA'
    const html = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
      ">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your WellPNA account.</p>
        <p>Please enter the following code to reset your password:</p>
        <div style="
          background-color: #f4f4f4;
          padding: 20px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
        ">
          ${resetCode}
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      </div>
    `

    try {
      await this.sendEmail({ to: email, subject, html })
    } catch (error) {
      logger.error('Failed to send password reset email:', error)
    }
  }
}
export const emailService = new EmailService()
