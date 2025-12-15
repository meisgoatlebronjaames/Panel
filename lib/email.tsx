// Email sending utility using Resend
const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function sendPasswordVerificationEmail(email: string, username: string, code: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured")
    return false
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Xyriel Panel <noreply@resend.dev>",
        to: [email],
        subject: "Password Change Verification Code - Xyriel Panel",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0f; color: #ffffff;">
            <h2 style="color: #10b981; margin-bottom: 20px;">Password Change Request</h2>
            
            <p style="color: #e5e5e5; margin-bottom: 15px;">Dear ${username},</p>
            
            <p style="color: #e5e5e5; margin-bottom: 15px;">
              We received a request to change the password for your Xyriel Panel account. 
              To verify this request, please use the following verification code:
            </p>
            
            <div style="background-color: #1a1a24; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #10b981;">${code}</span>
            </div>
            
            <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 15px;">
              This code will expire in 10 minutes. If you did not request a password change, 
              please ignore this email or contact support if you have concerns.
            </p>
            
            <hr style="border: none; border-top: 1px solid #2a2a35; margin: 20px 0;" />
            
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated message from Xyriel Panel. Please do not reply to this email.
            </p>
          </div>
        `,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
