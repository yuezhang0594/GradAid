import { supabase } from '../supabaseClient';
import { API_MODE, FASTAPI_URL } from './config';

class AuthService {
  async signUp(email, password, firstName, lastName) {
    if (API_MODE === 'supabase') {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim()
          }
        }
      });
      
      if (error) throw error;
      return data;
    } else {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);

      const response = await fetch(`${FASTAPI_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      return data;
    }
  }

  async signIn(email, password) {
    if (API_MODE === 'supabase') {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } else {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${FASTAPI_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      return data;
    }
  }

  async signInWithProvider(provider) {
    if (API_MODE === 'supabase') {
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      return data;
    } else {
      const response = await fetch(`${FASTAPI_URL}/auth/social-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Social login failed');
      }

      const data = await response.json();
      if (data.token_type === 'oauth_redirect' && data.access_token) {
        window.location.href = data.access_token;
        return;
      }

      localStorage.setItem('token', data.access_token);
      return data;
    }
  }

  async signOut() {
    if (API_MODE === 'supabase') {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.removeItem('token');
    }
  }

  async getSession() {
    if (API_MODE === 'supabase') {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } else {
      const token = localStorage.getItem('token');
      return token ? { access_token: token } : null;
    }
  }

  async resetPassword(email) {
    if (API_MODE === 'supabase') {
      const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    } else {
      const response = await fetch(`${FASTAPI_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Password reset request failed');
      }

      return await response.json();
    }
  }

  async updatePassword(newPassword) {
    if (API_MODE === 'supabase') {
      const { error, data } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return data;
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${FASTAPI_URL}/auth/update-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        throw new Error('Password update failed');
      }

      return await response.json();
    }
  }
}

const authService = new AuthService();
export default authService;
