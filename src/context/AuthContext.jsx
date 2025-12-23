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

const signUp = async (email, password, name) => {
  try {
    // 👇 **SUPABASE AUTH.SIGNUP WILL AUTOMATICALLY SEND VERIFICATION EMAIL**
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: "https://bigbull-camp-sigma.vercel.app/", // ✅ Correct URL
        data: { name: name }
      },
    });

    if (error) {
      // Handle specific errors
      if (error.message.includes('already registered') || 
          error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in.');
      }
      throw error;
    }

    console.log("Signup Data:", data);
    
    // Check if email was sent
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      // User exists but email not verified
      throw new Error('Account exists but not verified. Please check your email.');
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      role: "member",
      email: email,
    });

    if (profileError) {
      console.error("Profile error (non-critical):", profileError);
    }

    // **IF EMAIL NOT SENT, MANUALLY RESEND**
    if (data.user && !data.user.email_confirmed_at) {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: "https://bigbull-camp-sigma.vercel.app/",
        }
      });
      
      if (resendError) {
        console.error("Resend error:", resendError);
      } else {
        console.log("Verification email resent!");
      }
    }

    return "VERIFY_EMAIL";
    
  } catch (error) {
    console.error("Full signup error:", error);
    throw error;
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
      throw new Error("Please verify your email first.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}




