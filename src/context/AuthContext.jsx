import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= SESSION ================= */
  useEffect(() => {
    // Session check on reload
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
      async (_event, session) => {
        const u = session?.user;
        
        // Check if user exists in auth table
        if (u) {
          try {
            const { data: userExists } = await supabase
              .from("auth.users")
              .select("id")
              .eq("id", u.id)
              .single();
            
            if (!userExists) {
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              return;
            }
          } catch (error) {
            // If error, user doesn't exist or query failed
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            return;
          }
        }
        
        // Normal email confirmation check
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

    const checkProfile = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!data) {
          // Profile doesn't exist, logout user
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        // Error means profile doesn't exist or query failed
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
      }
    };

    checkProfile();
  }, [user]);

  /* ================= CHECK USER ON EVERY RELOAD ================= */
  // Extra safety check on every page reload
  useEffect(() => {
    const checkUserOnReload = async () => {
      if (!user) return;
      
      try {
        // Method 1: Check in auth.users (if you have access)
        const { data: authUser } = await supabase
          .from("auth.users")
          .select("id")
          .eq("id", user.id)
          .single();
          
        if (!authUser) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        // If auth.users not accessible, check profiles
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();
            
          if (!profileData) {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
          }
        } catch (profileError) {
          // If both fail, logout
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        }
      }
    };
    
    checkUserOnReload();
  }, []); // Empty dependency = runs on mount/reload

  /* ================= FORGOT PASSWORD ================= */
  const forgotPassword = async (email) => {
    try {
      console.log("Checking if email exists in profiles:", email);
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email.trim())
        .maybeSingle();

      if (profileError) {
        console.error("Profile check error:", profileError);
        throw new Error("System issue. Please try again.");
      }

      if (!profile) {
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
          emailRedirectTo: `${window.location.origin}`,
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
