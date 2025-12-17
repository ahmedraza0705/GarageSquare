# Supabase Branch Management Setup

## Step 1: Run the SQL Migration

1. **Open Supabase Dashboard**: Go to https://supabase.com/dashboard
2. **Navigate to SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Create New Query**: Click "New Query"
4. **Copy & Paste**: Copy the entire content from `supabase/migrations/001_create_branches_table.sql`
5. **Run**: Click "Run" button
6. **Verify**: Check that the query executed successfully

## Step 2: Verify Tables Created

Run this query in SQL Editor:
```sql
SELECT * FROM branches;
```

You should see the sample branches (Surat and Mumbai) if you kept the sample data.

## Step 3: Test the Hooks

The hooks are ready to use! Here's how:

### In BranchesScreen.tsx:
```typescript
import { useBranches, useCreateBranch, useDeleteBranch } from '@/hooks/useBranches';

// In your component:
const { branches, loading, error, refetch } = useBranches();
const { createBranch, loading: creating } = useCreateBranch();
const { deleteBranch } = useDeleteBranch();
```

## Available Hooks

### `useBranches()`
Fetches all active branches with real-time updates.
```typescript
const { branches, loading, error, refetch } = useBranches();
```

### `useBranch(id)`
Fetches a single branch by ID.
```typescript
const { branch, loading, error, refetch } = useBranch(branchId);
```

### `useCreateBranch()`
Creates a new branch.
```typescript
const { createBranch, loading, error } = useCreateBranch();

const result = await createBranch({
  name: 'New Branch',
  address: '123 Main St',
  phone: '+91 1234567890',
  email: 'branch@example.com',
  is_active: true
});
```

### `useUpdateBranch()`
Updates an existing branch.
```typescript
const { updateBranch, loading, error } = useUpdateBranch();

await updateBranch(branchId, { name: 'Updated Name' });
```

### `useDeleteBranch()`
Deletes a branch (soft delete by default).
```typescript
const { deleteBranch, loading, error } = useDeleteBranch();

await deleteBranch(branchId); // Soft delete (sets is_active = false)
await deleteBranch(branchId, true); // Hard delete (removes from DB)
```

### `useSearchBranches(query)`
Searches branches by name or address.
```typescript
const { branches, loading, error } = useSearchBranches(searchQuery);
```

## Next Steps

1. ✅ Run the SQL migration
2. ✅ Verify tables created
3. ⏳ Update BranchesScreen to use `useBranches()`
4. ⏳ Update BranchDetailsScreen to use `useBranch(id)`
5. ⏳ Test create, update, delete operations

## Troubleshooting

**Error: "Supabase client not initialized"**
- Check your `.env` file has `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Restart expo with `npx expo start --clear`

**Error: "permission denied for table branches"**
- Make sure RLS policies are created (they're in the migration SQL)
- Check your user has the `company_admin` role

**No data showing**
- Check Supabase dashboard to see if data exists
- Check browser console for errors
- Try calling `refetch()` manually
