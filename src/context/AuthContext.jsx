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

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);
/* ================= FORGOT PASSWORD ================= */
const forgotPassword = async (email) => {
  try {
    console.log("Checking if email exists in profiles:", email);
    
    // ✅ STEP 1: PEHLE PROFILES TABLE SE EMAIL CHECK KAREIN
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email.trim()) // Saaf email se check karein
      .maybeSingle(); // Agar record na mile toh error na de

    if (profileError) {
      console.error("Profile check error:", profileError);
      throw new Error("System issue. Please try again.");
    }

    // ✅ STEP 2: AGAR PROFILES MAI EMAIL NAHI MILA
    if (!profile) {
      // Frontend ko success hi batayein, taake koi bata na sake ke kon sa email registered hai
      return true;
    }

    
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("Reset link send error:", error);
      if (error.message.includes("rate limit")) {
        throw new Error("Too many attempts");
      } else {
        throw new Error(`Reset link Failure: ${error.message}`);
      }
    }

    console.log("Reset email successfully");
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
      // 👇 Step 1: Check if email already exists in profiles
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

      // 👇 Step 2: Create auth user (sends verification email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      if (!data?.user) {
        throw new Error("Failed to create user account");
      }

      // 👇 Profile will be created automatically by trigger after email verification
      
      // 👇 Step 3: Accept invites (optional)
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
        forgotPassword, // Use proper version
        resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
