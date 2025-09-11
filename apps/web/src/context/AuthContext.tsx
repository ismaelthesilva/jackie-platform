'use client'

// Authentication Context
// Manages user authentication state throughout the app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Handle specific database errors
        if (error.code === 'PGRST116') {
          console.warn('No user profile found, this might be expected for new users');
          return;
        }
        if (error.code === '42P01') {
          console.warn('user_profiles table does not exist yet');
          return;
        }
        console.error('Error loading user profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      if (data) {
        setUserProfile(data);
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      console.error('Error loading user profile:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.warn('Supabase not configured properly:', error);
        // Continue without auth if Supabase is not configured
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn('Could not set up auth listener:', error);
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    session,
    userProfile,
    loading,
    isAdmin,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
