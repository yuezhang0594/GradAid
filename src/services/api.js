const API_URL = 'http://localhost:8000/api';

export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
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

  return response.json();
};

export const signup = async (email, password, firstName, lastName) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/signup`, {
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

  return response.json();
};

export const createProfile = async (profileData, token) => {
  const response = await fetch(`${API_URL}/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to create profile');
  }

  return response.json();
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/profiles/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch profile');
  }

  return response.json();
};

export const updateProfile = async (profileData, token) => {
  const response = await fetch(`${API_URL}/profiles/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  return response.json();
};
