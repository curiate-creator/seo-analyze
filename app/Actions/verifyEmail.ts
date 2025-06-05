export const verifyEmail = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error("Email verification error:", error);
    return false;
  }
};
