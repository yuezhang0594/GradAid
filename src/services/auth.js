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
}

export const authService = new AuthService();
