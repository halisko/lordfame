import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  username: string;
  role: 'chief' | 'moderator' | 'operator' | 'user' | 'worker'; // Include worker for backward compatibility
  balance: number;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getRoleDisplayName = (role: 'chief' | 'moderator' | 'operator' | 'user' | 'worker') => {
    const roles = {
      chief: 'Главный',
      moderator: 'Модератор', 
      operator: 'Оператор',
      user: 'Пользователь',
      worker: 'Модератор' // Legacy support
    };
    return roles[role];
  };

  const hasPermission = (requiredRole: 'chief' | 'moderator' | 'operator' | 'user') => {
    if (!profile) return false;
    
    const roleHierarchy = {
      chief: 4,
      moderator: 3,
      worker: 3, // Legacy support - same as moderator
      operator: 2,
      user: 1
    };
    
    return roleHierarchy[profile.role as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole];
  };

  useEffect(() => {
    // Fetch user profile with role from user_roles table
    const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
      try {
        console.log('[useAuth] Fetching profile for user:', userId);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error('[useAuth] Error fetching profile:', profileError);
          return null;
        }

        console.log('[useAuth] Profile data:', profileData);

        // Fetch user's highest role from user_roles table
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        if (rolesError) {
          console.error('[useAuth] Error fetching roles:', rolesError);
          // Default to 'user' role if no roles found
          return { ...profileData, role: 'user' as const };
        }

        console.log('[useAuth] Roles data:', rolesData);

        // Determine highest role based on hierarchy
        type RoleType = 'chief' | 'moderator' | 'operator' | 'user' | 'worker';
        const roleHierarchy: Record<RoleType, number> = { 
          chief: 4, 
          moderator: 3, 
          worker: 3, 
          operator: 2, 
          user: 1 
        };
        let highestRole: RoleType = 'user';
        let highestLevel = 0;

        rolesData?.forEach((roleRecord) => {
          const role = roleRecord.role as RoleType;
          const level = roleHierarchy[role] || 0;
          if (level > highestLevel) {
            highestLevel = level;
            highestRole = role;
          }
        });

        console.log('[useAuth] Final role:', highestRole);

        return { ...profileData, role: highestRole };
      } catch (error) {
        console.error('[useAuth] Error in profile fetch:', error);
        return null;
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state changed:', event, session?.user?.id);
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profileData = await fetchUserProfile(session.user.id);
            setProfile(profileData);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('[useAuth] Error in auth state change handler:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[useAuth] Initial session check:', session?.user?.id);
      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchUserProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('[useAuth] Error in initial session check:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username
          }
        }
      });

      if (error) {
        toast({
          title: "Ошибка регистрации",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Регистрация успешна",
        description: "Проверьте электронную почту для подтверждения аккаунта"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Ошибка входа",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Добро пожаловать",
        description: "Вы успешно вошли в систему"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Ошибка выхода",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "До свидания",
        description: "Вы успешно вышли из системы"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Ошибка обновления",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Update local profile state
      if (profile) {
        setProfile({ ...profile, ...updates });
      }

      toast({
        title: "Профиль обновлен",
        description: "Изменения сохранены успешно"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getRoleDisplayName,
    hasPermission,
    isChief: profile?.role === 'chief',
    isModerator: hasPermission('moderator'),
    isOperator: hasPermission('operator'),
    isAuthenticated: !!user
  };
};