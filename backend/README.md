# GradAid Backend

This is the FastAPI backend for the GradAid application, using Supabase for authentication and data storage.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Get your Supabase credentials from your project settings

4. Create a `.env` file in the backend directory with the following content:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Run the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access:
- Interactive API documentation: http://localhost:8000/docs
- Alternative API documentation: http://localhost:8000/redoc

## Available Endpoints

### Authentication
- POST /api/auth/signup - Create a new user account
- POST /api/auth/login - Login with existing credentials

### Profiles
- POST /api/profiles - Create a user profile
- GET /api/profiles/me - Get current user's profile
- PUT /api/profiles/me - Update current user's profile

## Database Schema

The application uses the following Supabase tables:

### profiles
```sql
create table User (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  country text,
  education_level text,
  major text,
  gpa numeric(3,2),
  gre_score integer,
  toefl_score integer,
  ielts_score numeric(2,1),
  profile_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id)
);

-- Enable RLS
alter table User enable row level security;

-- Create policies
create policy "Users can view their own profile" 
  on User for select 
  using (auth.uid() = id);

create policy "Users can create their own profile" 
  on User for insert 
  with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on User for update 
  using (auth.uid() = id);
```
