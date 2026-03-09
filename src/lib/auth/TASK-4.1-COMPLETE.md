# Task 4.1: Create Admin Middleware - COMPLETE

## Implementation Summary

The `requireAdmin()` middleware function has been successfully implemented in `src/lib/auth/admin.ts`.

## Requirements Fulfilled

### Requirement 15.1: Unauthenticated User Handling
✅ **Implemented**: Throws `UnauthorizedError` when user is not authenticated
- Uses Supabase `auth.getUser()` to check session
- Returns descriptive error message: "You must be logged in to access this resource"

### Requirement 15.2: Non-Admin User Handling  
✅ **Implemented**: Throws `ForbiddenError` when authenticated user lacks admin role
- Queries `UserRole` table to verify admin role
- Returns descriptive error message: "You do not have permission to access this resource"

### Requirement 15.3-15.6: Admin Role Verification
✅ **Implemented**: Verifies user role is "admin" before allowing access
- Uses Prisma query: `db.userRole.findFirst({ where: { userId, role: 'admin' } })`
- Works for banner management routes, sponsor management routes, and all CRUD operations

### Requirement 15.7: HTTP Status Codes
✅ **Implemented**: Appropriate error types for HTTP status mapping
- `UnauthorizedError` → HTTP 401 (Unauthorized)
- `ForbiddenError` → HTTP 403 (Forbidden)
- Both include descriptive error messages

## Implementation Details

### File Created
- `src/lib/auth/admin.ts` - Main middleware implementation

### Key Components

1. **AdminUser Interface**
   ```typescript
   interface AdminUser {
     id: string;
     email: string;
     userId: string;
   }
   ```

2. **Error Classes**
   - `UnauthorizedError` - For authentication failures
   - `ForbiddenError` - For authorization failures

3. **requireAdmin() Function**
   - Checks Supabase session
   - Queries UserRole table
   - Returns AdminUser object on success
   - Throws appropriate errors on failure

### Usage Example

```typescript
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const admin = await requireAdmin();
    
    // Admin-only logic here
    return NextResponse.json({ 
      message: 'Admin access granted',
      adminId: admin.id 
    });
    
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 401 }
      );
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 403 }
      );
    }
    throw error;
  }
}
```

## Testing

### Unit Tests
- ✅ Error class instantiation
- ✅ Error message handling
- ✅ Function export verification

### Integration Tests
- ✅ Unauthenticated access rejection
- ✅ Error type verification
- ✅ Database integration
- ✅ Return type structure

### Test Files
- `src/lib/auth/admin.test.ts` - Unit tests
- `src/lib/auth/admin.integration.test.ts` - Integration tests

## Dependencies

- **Supabase**: For session management (`@/lib/supabase/server`)
- **Prisma**: For database queries (`@/lib/db`)
- **Database**: Requires `UserRole` table with `userId` and `role` fields

## Related Files

- `src/lib/auth/checkRole.ts` - Helper functions for role checking
- `src/lib/db.ts` - Prisma client instance
- `src/lib/supabase/server.ts` - Supabase server client

## Task Completion Checklist

- ✅ Create `src/lib/auth/admin.ts` with `requireAdmin()` function
- ✅ Check user session using Supabase authentication
- ✅ Query UserRole table to verify admin role
- ✅ Throw appropriate errors for unauthorized/forbidden access
- ✅ Return authenticated admin user object
- ✅ Implement all requirements (15.1-15.7)
- ✅ Add comprehensive tests
- ✅ Document usage and examples

## Notes

The implementation uses Supabase for authentication instead of NextAuth as originally specified in the design document. This is consistent with the existing codebase architecture and provides the same functionality.

The middleware is ready to be used in all admin API routes for banner and sponsor management.
