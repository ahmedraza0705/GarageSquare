# Garage Square - Garage Management System

A comprehensive garage management system built with React Native (Expo), TypeScript, NativeWind, and Supabase.

## Features

- 🔐 Role-based authentication (6 roles)
- 🏢 Multi-branch support
- 👥 Customer & Vehicle management
- 📋 Job Card / Work Order system
- 💰 Payment tracking
- 🔔 Notifications
- 🛡️ Row Level Security (RLS) policies

## Roles

1. **Company Admin** - Full system access
2. **Manager** - Branch-level management
3. **Supervisor** - Job card and team control
4. **Technician Group Manager** - Job assignment
5. **Technician** - Task updates and progress
6. **Customer** - Service history view

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Update `.env` with your Supabase credentials

3. Start the app:
```bash
npm start
```

## Environment Variables

Create a `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

