# Garage Square - Project Structure

## 📁 Folder Structure

```
garage-square/
├── App.tsx                          # App entry point
├── global.css                       # NativeWind global styles
├── metro.config.js                  # Metro bundler config with NativeWind
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.js               # Tailwind CSS config
├── babel.config.js                  # Babel config
├── app.json                         # Expo config
├── .env.example                     # Environment variables example
│
├── database/
│   └── schema.sql                   # Complete Supabase schema with RLS
│
└── src/
    ├── components/
    │   └── shared/
    │       ├── Button.tsx           # Reusable button component
    │       └── Input.tsx            # Reusable input component
    │
    ├── constants/
    │   └── permissions.ts           # Permission matrix and utilities
    │
    ├── hooks/
    │   ├── useAuth.ts               # Authentication hook
    │   ├── useRole.ts               # Role checking hook
    │   └── usePermission.ts         # Permission checking hook
    │
    ├── lib/
    │   └── supabase.ts              # Supabase client configuration
    │
    ├── navigation/
    │   ├── RootNavigator.tsx        # Root navigation container
    │   ├── AuthNavigator.tsx        # Authentication flow navigation
    │   ├── RoleBasedNavigator.tsx   # Role-based routing
    │   └── role/
    │       ├── CompanyAdminNavigator.tsx
    │       ├── ManagerNavigator.tsx
    │       ├── SupervisorNavigator.tsx
    │       ├── TechnicianGroupManagerNavigator.tsx
    │       ├── TechnicianNavigator.tsx
    │       └── CustomerNavigator.tsx
    │
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   ├── SignupScreen.tsx
    │   │   └── ForgotPasswordScreen.tsx
    │   │
    │   ├── company-admin/
    │   │   ├── DashboardScreen.tsx
    │   │   ├── BranchesScreen.tsx
    │   │   ├── UsersScreen.tsx
    │   │   └── ReportsScreen.tsx
    │   │
    │   ├── manager/
    │   │   ├── DashboardScreen.tsx
    │   │   ├── CustomersScreen.tsx
    │   │   ├── VehiclesScreen.tsx
    │   │   ├── JobCardsScreen.tsx
    │   │   └── PaymentsScreen.tsx
    │   │
    │   ├── supervisor/
    │   │   ├── DashboardScreen.tsx
    │   │   ├── JobCardsScreen.tsx
    │   │   ├── TasksScreen.tsx
    │   │   └── TeamScreen.tsx
    │   │
    │   ├── technician-group-manager/
    │   │   ├── DashboardScreen.tsx
    │   │   ├── JobCardsScreen.tsx
    │   │   └── TasksScreen.tsx
    │   │
    │   ├── technician/
    │   │   ├── DashboardScreen.tsx
    │   │   ├── MyJobCardsScreen.tsx
    │   │   └── MyTasksScreen.tsx
    │   │
    │   ├── customer/
    │   │   ├── DashboardScreen.tsx
    │   │   ├── MyVehiclesScreen.tsx
    │   │   ├── MyJobCardsScreen.tsx
    │   │   └── MyPaymentsScreen.tsx
    │   │
    │   └── shared/
    │       ├── SettingsScreen.tsx
    │       ├── CustomerDetailScreen.tsx
    │       ├── VehicleDetailScreen.tsx
    │       ├── JobCardDetailScreen.tsx
    │       ├── TaskDetailScreen.tsx
    │       ├── CreateCustomerScreen.tsx
    │       ├── CreateVehicleScreen.tsx
    │       └── CreateJobCardScreen.tsx
    │
    ├── services/
    │   ├── auth.service.ts          # Authentication service
    │   ├── customer.service.ts      # Customer CRUD operations
    │   ├── vehicle.service.ts       # Vehicle CRUD operations
    │   ├── jobCard.service.ts       # Job card operations
    │   └── task.service.ts          # Task operations
    │
    └── types/
        └── index.ts                 # TypeScript type definitions
```

## 🔑 Key Features

### Authentication
- Email/password login & signup
- Role-based login redirect
- Forgot password flow
- Session handling with SecureStore

### Role-Based Access Control
- 6 roles: Company Admin, Manager, Supervisor, Technician Group Manager, Technician, Customer
- Permission matrix for fine-grained access control
- RLS policies in Supabase for data security

### Database Schema
- Complete schema with all tables
- Row Level Security (RLS) policies
- Foreign key relationships
- Indexes for performance
- Seed data for roles and permissions

### Navigation
- Root navigator with auth state management
- Role-based navigation routing
- Tab navigation for each role
- Stack navigation for detail screens

### Services
- Auth service for authentication
- Customer, Vehicle, JobCard, Task services
- All services use Supabase client with RLS

## 🚀 Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a Supabase project
   - Run the SQL from `database/schema.sql` in Supabase SQL editor
   - Copy your Supabase URL and anon key

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials

4. **Start the app:**
   ```bash
   npm start
   ```

## 📝 Notes

- All screens follow the Figma design structure
- NativeWind classes are used throughout for styling
- TypeScript interfaces ensure type safety
- RLS policies protect data at the database level
- Permission checks happen at both frontend and backend

