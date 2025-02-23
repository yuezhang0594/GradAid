# GradAid

GradAid is an AI-powered graduate school application assistant that helps students manage their application process, track universities, and get personalized guidance for their graduate studies journey.

## Features

- User Profile Management
- Interactive Chatbot
- University Application Tracker

## Tech Stack

### Frontend
- React with Vite
- TailwindCSS for styling
- Framer Motion for animations
- React Router for navigation
- TypeScript support

### Backend
- FastAPI
- Supabase for authentication and data storage
- Cross-origin resource sharing (CORS) enabled

## Roadmap

### Upcoming Features
- Document upload and management system
- University search functionality with sorting and filtering
- Enhanced chatbot capabilities with LangChain integration
- Conversation history tracking

## Authors
- Joseph Rissman
- Yue Zhang
- Nitin Krishna Bojji


# Version 1.1.0

## New Features
- (Joseph) Added comprehensive user profile system with education details, test scores, and background information
- (Yue) Added interactive chatbot with automated response
- (Yue) Introduced expandable instructions panel with application guidance
- (Yue) Implemented university application tracking system with progress monitoring

## UI/UX Improvements
- (Yue) Added animated flip cards for university applications
- (Joseph) Enhanced form validation with real-time feedback
- (Yue) Implemented profile completion indicator in header
- (Joseph) Added responsive navigation with active state indicators
- (Joseph) Improved accessibility with keyboard navigation support
- (Joseph) Added visual feedback for form validation states
- (Yue) Added progress bars for application tracking
- (Yue) Implemented notification sounds for chat interactions
- (Joseph) Added loading states and visual feedback for form submissions
- (Joseph) Implemented error message styling for form validation
- (Yue) Added hover states and transitions for interactive elements

## Improvements
- (Yue) Enhanced authentication system with social login support
- (Yue) Added persistent session management
- (Yue) Implemented responsive header with navigation
- (Yue) Added profile completion indicator

## Technical Updates
- (Yue & Joseph) Integrated Supabase for backend services
- (Yue) Added FastAPI backend support
- (Yue) Implemented cross-origin resource sharing (CORS)
- (Joseph) Added version display in UI

## Developer Experience
- (Yue) Added comprehensive TypeScript support
- (Joseph) Improved error handling and validation
- (Yue & Joseph) Enhanced development configuration with Vite

## Backlog
- (Nitin) Add support for document upload and management
- (Joseph) Create admin dashboard for user management
- (Yue & Nitin) Implement search functionality for universities
- (Yue & Nitin) Add sorting and filtering options for application list
- (Yue) Create email notification system for application status updates
- (Joseph & Nitin) Implement data export functionality for user profiles
- (All) Create automated test suite for critical components
- (Nitin) Integrate LangChain for enhanced chatbot capabilities
- (Joseph) Implement memory management for contextual responses
- (Joseph) Add document loading and processing capabilities
- (Nitin) Integrate custom prompts and chains for education-specific queries
- (Nitin) Add support for multiple language models
- (Joseph) Implement conversation history tracking

## Known Bugs
- (Yue) Chat notifications sometimes play multiple times
- (Joseph) Form submission occasionally triggers multiple API calls
- (Joseph) Profile fetch is not working for new users
