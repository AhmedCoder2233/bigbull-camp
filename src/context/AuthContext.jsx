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
  // 👇 FIRST CHECK IF USER ALREADY EXISTS
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 means "no rows returned" which is okay
    throw checkError;
  }

  // 👇 If user already exists with this email
  if (existingUser) {
    throw new Error('An account with this email already exists. Please use a different email or sign in.');
  }

  // 👇 Proceed with signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "https://bigbull-camp-sigma.vercel.app/",
    },
  });

  if (error) throw error;

  // 👇 PROFILE INSERT (SAFE)
  await supabase.from("profiles").insert({
    id: data.user.id,
    name,
    role: "member",
    email: email,
  });

  // 👇 ACCEPT INVITES USING SAME EMAIL
  await supabase.rpc("accept_workspace_invites", {
    user_email: email,
    user_id: data.user.id,
  });

  return "VERIFY_EMAIL";
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


