'use server';

export async function verifyEmail(email: string): Promise<boolean> {
  try {
    // Get authorized emails from environment variable
    const authorizedEmails = process.env.AUTHORIZED_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    
    // Check if the provided email is in the authorized list
    const isAuthorized = authorizedEmails.includes(email.toLowerCase());
    
    return isAuthorized;
  } catch (error) {
    console.error('Email verification error:', error);
    return false;
  }
}
