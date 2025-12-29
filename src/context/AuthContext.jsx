import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= SESSION ================= */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;

      if (u && !u.email_confirmed_at) {
        setUser(null);
      } else {
        setUser(u ?? null);
      }

      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user;

        if (u && !u.email_confirmed_at) {
          setUser(null);
        } else {
          setUser(u ?? null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  /* ================= PROFILE ================= */
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    // Profile fetch karo aur check karo ke exist karta hai ya nahi
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        // ✅ Agar profile nahi mila (deleted ho gaya) toh logout kar do
        if (error || !data) {
          console.log("Profile not found - logging out user");
          supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          return;
        }
        
        setProfile(data);
      });
  }, [user]);

  /* ================= FORGOT PASSWORD ================= */
   const forgotPassword = async (email) => {
    try {
      console.log("Sending password reset email to:", email);
      
      // Step 1: Check if user exists (optional but good UX)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email.trim())
        .maybeSingle();

      if (profileError) {
        console.error("Profile check error:", profileError);
        throw new Error("System issue. Please try again.");
      }

      // Security: Always return success even if email doesn't exist
      // This prevents email enumeration attacks
      if (!profile) {
        console.log("Email not found, but returning success for security");
        return true;
      }

      // Step 2: Send reset email with CORRECT redirect URL
      // IMPORTANT: Use your actual domain
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      console.log("Sending reset email with redirect:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error("Reset link send error:", error);
        
        // Handle specific errors
        if (error.message.includes("rate limit")) {
          throw new Error("Too many attempts. Please try again in a few minutes.");
        } else if (error.message.includes("not found")) {
          // Still return success for security
          return true;
        } else {
          throw new Error(`Failed to send reset link: ${error.message}`);
        }
      }

      console.log("Reset email sent successfully");
      return true;

    } catch (err) {
      console.error("Forgot password error:", err);
      throw err;
    }
  };

  /* ================= RESET PASSWORD ================= */
  const resetPassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return true;
    } catch (err) {
      console.error("Reset password error:", err);
      throw err;
    }
  };

  /* ================= SIGN UP ================= */
  const signUp = async (email, password, name) => {
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        throw new Error(
          "An account with this email already exists. Please sign in instead."
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `https://bigbullcamp.com/`,
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      if (!data?.user) {
        throw new Error("Failed to create user account");
      }

      try {
        await supabase.rpc("accept_workspace_invites", {
          user_email: email,
          user_id: data.user.id,
        });
      } catch (err) {
        console.warn("Invite acceptance skipped:", err);
      }

      return "VERIFY_EMAIL";
    } catch (err) {
      console.error("SignUp error:", err);
      throw err;
    }
  };

  /* ================= SIGN IN ================= */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      throw new Error(
        "Please verify your email first. Check your inbox for the verification link."
      );
    }
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        profile, 
        loading, 
        signUp, 
        signIn, 
        logout,
        forgotPassword,
        resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

