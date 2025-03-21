import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  email = "jangidmohit408@gmail.com";
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email send successfully", response);
  } catch (error) {
    console.log("Error while sending verification email", error);
    throw new Error(`Error while sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  email = "jangidmohit408@gmail.com";
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "6f6946a7-a0fc-45f5-b703-2d83ceeef472",
      template_variables: {
        company_info_name: "Auth Company",
        name: name,
      },
    });

    console.log("welcome email sent successfully!");
  } catch (error) {}
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  email = "jangidmohit408@gmail.com";
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset password email",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
      category: "Reset Password",
    });

    console.log("reset password Email sent successfully", response);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const sendResetSuccessEmail = async (email) => {
  email = "jangidmohit408@gmail.com";
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log("reset password Email sent successfully", response);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
