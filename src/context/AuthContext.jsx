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
    
    console.log("🔄 Starting signup for:", cleanEmail); // Debug log
    
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: "https://bigbull-camp-sigma.vercel.app/auth/callback",
        data: { 
          name: name,
          email: cleanEmail 
        }
      },
    });

    console.log("📊 Signup response:", { data, error }); // Debug log

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('An account with this email already exists. Please sign in.');
      }
      throw error;
    }

    if (!data?.user) {
      throw new Error('Failed to create user account');
    }

    console.log("✅ User signup successful:", data.user.id);
    
    // Wait for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Verify profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    console.log("👤 Profile check:", { profile, profileError });

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn("⚠️ Profile not found, creating manually...");
      
      // Manual fallback insert
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: name,
          email: cleanEmail,
          role: 'member',
          status: 'active'
        });
      
      if (insertError) {
        console.error("❌ Manual profile insert failed:", insertError);
        throw new Error('Failed to create user profile');
      }
    }

    // Return simple string for component check
    return "VERIFY_EMAIL";
    
  } catch (error) {
    console.error("❌ Signup error:", error);
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







