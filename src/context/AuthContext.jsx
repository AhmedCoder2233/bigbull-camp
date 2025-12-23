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
    console.log("🔵 Starting signUp for:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:5173",
        data: {
          name: name, // Store name in user metadata
        }
      },
    });

    console.log("🔵 Auth signUp response:", { data, error });

    if (error) throw error;

    // Check if user was created (some setups auto-confirm)
    if (!data.user) {
      throw new Error("User creation failed");
    }

    console.log("🔵 User created:", data.user.id);

    // 👇 CHECK IF PROFILE ALREADY EXISTS
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle(); // Use maybeSingle() instead of single()

    console.log("🔵 Existing profile check:", { existingProfile, checkError });

    // 👇 ONLY INSERT IF PROFILE DOESN'T EXIST
    if (!existingProfile) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          name,
          role: "member",
          email: email,
        })
        .select()
        .single();

      console.log("🔵 Profile insert result:", { profileData, profileError });

      if (profileError) {
        console.error("❌ Profile creation failed:", profileError);
        throw profileError;
      }
    }

    // 👇 ACCEPT INVITES USING SAME EMAIL
    try {
      const { data: inviteData, error: inviteError } = await supabase.rpc(
        "accept_workspace_invites",
        {
          user_email: email,
          user_id: data.user.id,
        }
      );
      console.log("🔵 Invite acceptance result:", { inviteData, inviteError });
    } catch (inviteErr) {
      console.warn("⚠️ Invite acceptance failed (non-critical):", inviteErr);
      // Don't throw - invites are optional
    }

    console.log("✅ SignUp completed successfully");
    return "VERIFY_EMAIL";
  } catch (err) {
    console.error("❌ SignUp failed:", err);
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









