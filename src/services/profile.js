import { supabase } from '../supabaseClient';
import { API_MODE, FASTAPI_URL } from './config';

class ProfileService {
  async createProfile(profileData) {
    if (API_MODE === 'supabase') {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user authenticated');

      const formattedData = {
        ...profileData,
        dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : null,
      };

      const { data, error } = await supabase
        .from('User')
        .upsert(formattedData);

      if (error) throw error;
      return data;
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${FASTAPI_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      return response.json();
    }
  }

  async getProfile() {
    if (API_MODE === 'supabase') {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error, data } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${FASTAPI_URL}/profiles/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch profile');
      }

      return response.json();
    }
  }

  async updateProfile(profileData) {
    if (API_MODE === 'supabase') {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error, data } = await supabase
        .from('User')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;
      return data;
    } else {
      const token = localStorage.getItem('token');
      const response = await fetch(`${FASTAPI_URL}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return response.json();
    }
  }
}

export const profileService = new ProfileService();
