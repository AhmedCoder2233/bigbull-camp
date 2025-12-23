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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 👇 Dono URLs add karo
        emailRedirectTo: "https://bigbull-camp-sigma.vercel.app/auth/callback",
        data: {
          name: name,
        }
      },
    });

    if (error) {
      if (error.message.includes('already registered') || 
          error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw error;
    }

    console.log("Signup response:", data); // Debug ke liye
    
    // Agar user confirmed nahi hai toh profile create karo
    if (!data.user?.email_confirmed_at) {
      // 👇 PROFILE INSERT
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        role: "member",
        email: email,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      // 👇 ACCEPT INVITES
      const { error: inviteError } = await supabase.rpc("accept_workspace_invites", {
        user_email: email,
        user_id: data.user.id,
      });

      if (inviteError) {
        console.error("Invite acceptance error:", inviteError);
      }

      // Email confirmation send hone ke baad ye message show karo
      if (data.user?.identities?.length === 0) {
        // This means user already exists but not confirmed
        return "CHECK_EMAIL_FOR_CONFIRMATION";
      }
      
      return "VERIFY_EMAIL";
    }
    
    // Agar already confirmed hai toh sign in karne do
    return "SIGN_IN_SUCCESS";
    
  } catch (error) {
    console.error("Signup error:", error);
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



