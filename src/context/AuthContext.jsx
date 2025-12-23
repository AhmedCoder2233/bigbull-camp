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
    const cleanEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: "https://bigbull-camp-sigma.vercel.app/",
        data: { name: name }
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('An account with this email already exists. Please sign in.');
      }
      throw error;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      name,
      role: "member",
      email: cleanEmail,
    });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Profile error ko throw mat karo, bas log karo
    }

    console.log("✅ User created successfully");
    return "VERIFY_EMAIL";
    
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





