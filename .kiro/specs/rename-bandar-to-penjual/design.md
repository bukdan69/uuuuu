# Rename Bandar to Penjual Bugfix Design

## Overview

This bugfix addresses incorrect terminology throughout the system where "bandar" (gambling operator) is used instead of "penjual" (seller/merchant). The fix involves renaming the role enum value, updating all TypeScript functions and type definitions, modifying UI labels, and ensuring database consistency through a migration. The approach is a systematic find-and-replace operation across multiple layers while preserving all existing functionality, permissions, and user data for all roles.

## Glossary

- **Bug_Condition (C)**: Any code location, database value, or UI text that references "bandar" instead of "penjual"
- **Property (P)**: The desired state where all references use "penjual" consistently and correctly
- **Preservation**: All existing role-based permissions, authentication flows, and user access rights must remain unchanged
- **Role Enum**: The `app_role` enum in PostgreSQL and Prisma schema defining user roles (user, admin, bandar/penjual)
- **isBandar()**: Function in `src/lib/auth/checkRole.ts` that checks if a user has the seller role
- **checkUserRole()**: Function that verifies if a user has a specific role
- **UserRole model**: Prisma model storing role assignments with userId and role fields

## Bug Details

### Bug Condition

The bug manifests when any part of the system references the seller/merchant role. The term "bandar" appears in database schema definitions, TypeScript function names, type definitions, UI labels, API responses, and administrative scripts. This creates cultural inappropriateness and potential confusion since "bandar" typically refers to a gambling operator in Indonesian.

**Formal Specification:**
```
FUNCTION isBugCondition(codeElement)
  INPUT: codeElement of type CodeLocation (file path, line, content)
  OUTPUT: boolean
  
  RETURN codeElement.content CONTAINS 'bandar' 
         AND codeElement.context IN ['role_definition', 'role_check', 'role_display', 'role_assignment']
         AND NOT codeElement.isComment
         AND NOT codeElement.isHistoricalReference
END FUNCTION
```

### Examples

- **Database Schema**: `CREATE TYPE app_role AS ENUM ('user', 'admin', 'bandar')` should be `'penjual'`
- **TypeScript Function**: `export async function isBandar(): Promise<boolean>` should be `isPenjual()`
- **UI Display**: Admin panel shows "bandar" in role dropdown should show "penjual"
- **API Response**: `{ "roles": ["bandar"], "isBandar": true }` should return `"penjual"` and `"isPenjual"`
- **Database Records**: Existing user_roles table rows with `role = 'bandar'` should become `role = 'penjual'`
- **Edge Case**: Comments or documentation referencing the old term for historical context should be preserved

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Users with the seller role must continue to have identical permissions and access rights
- Authentication and session management must continue to work without requiring re-login
- Role-based access control (RBAC) checks must enforce the same security rules
- Admin and user roles must remain completely unaffected
- All existing database queries filtering by role must continue to return correct results
- Role assignment and removal workflows must function identically

**Scope:**
All functionality that does NOT involve the specific string "bandar" should be completely unaffected by this fix. This includes:
- User authentication flows
- Admin role permissions and checks
- Regular user role permissions
- Database query logic (only the role value changes, not the query structure)
- Authorization middleware and guards
- Session validation

## Hypothesized Root Cause

Based on the bug description and codebase analysis, the root cause is:

1. **Initial Design Decision**: The system was originally designed with "bandar" as the seller role name, likely without full consideration of the cultural connotations of the term in Indonesian

2. **Propagation Across Layers**: Once defined in the database schema, the term propagated to:
   - Prisma schema enum definition
   - TypeScript type definitions generated from Prisma
   - Function names following the pattern `is{RoleName}()`
   - UI labels displaying role names
   - API responses serializing role data
   - Administrative scripts for role management

3. **No Centralized Terminology**: The lack of a centralized terminology configuration meant the term was hardcoded in multiple locations

4. **Database Enum Constraint**: The PostgreSQL enum type creates a constraint that requires a migration to change, affecting all existing records

## Correctness Properties

Property 1: Bug Condition - All References Use "Penjual"

_For any_ code location, database value, or UI text where the seller role is referenced, the fixed system SHALL use "penjual" instead of "bandar", ensuring culturally appropriate and professional terminology throughout the application.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

Property 2: Preservation - Role Functionality Unchanged

_For any_ user with the seller role (previously "bandar", now "penjual"), the fixed system SHALL provide exactly the same permissions, access rights, and functionality as before the terminology change, preserving all role-based access control behavior.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `prisma/schema.prisma`

**Changes**:
1. **Update UserRole Model Comment**: Change comment from `// user, admin, bandar` to `// user, admin, penjual`

**File**: `database-fixes/migration_to_supabase_part1.sql`

**Changes**:
1. **Update Enum Definition**: Change `CREATE TYPE app_role AS ENUM ('user', 'admin', 'bandar')` to include 'penjual'

**File**: `database-fixes/schema_complete_fixed.sql`

**Changes**:
1. **Update Enum Definition**: Change `CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'bandar')` to include 'penjual'

**File**: `src/lib/auth/checkRole.ts`

**Function**: `isBandar()`

**Specific Changes**:
1. **Rename Function**: Change `export async function isBandar()` to `export async function isPenjual()`
2. **Update Function Call**: Change `return await checkUserRole(user.id, 'bandar')` to `checkUserRole(user.id, 'penjual')`
3. **Update JSDoc Comment**: Change comment from "Check if current authenticated user is bandar" to "Check if current authenticated user is penjual"

**File**: `src/lib/supabase.ts`

**Changes**:
1. **Update Type Definition**: Change `Args: { _user_id: string; _role: 'user' | 'admin' | 'bandar' }` to `'penjual'`
2. **Update Enum Type**: Change `app_role: 'user' | 'admin' | 'bandar'` to `'penjual'`

**File**: `src/app/api/auth/check-role/route.ts`

**Changes**:
1. **Rename Variable**: Change `const isBandar = await checkUserRole(user.id, 'bandar')` to `const isPenjual = await checkUserRole(user.id, 'penjual')`
2. **Update Response**: Change response object key from `isBandar` to `isPenjual`

**File**: `scripts/assign-role.ts`

**Changes**:
1. **Update Type Definition**: Change `const roleToAssign: 'admin' | 'bandar'` to `'admin' | 'penjual'`
2. **Update Comment**: Change comment from `// Ganti dengan 'bandar' jika ingin assign role bandar` to reference 'penjual'
3. **Update Console Log**: Change `else if (roleToAssign === 'bandar')` to `'penjual'` and update message

**File**: `scripts/remove-role.ts`

**Changes**:
1. **Update Type Definition**: Change `const roleToRemove: 'admin' | 'bandar'` to `'admin' | 'penjual'`
2. **Update Comment**: Change comment to reference 'penjual' instead of 'bandar'

**File**: `scripts/list-all-roles.ts`

**Changes**:
1. **Update Variable Name**: Change `const bandarUsers = allRoles.filter(r => r.role === 'bandar')` to `const penjualUsers` and filter for 'penjual'
2. **Update Console Logs**: Change all references from "Bandar" to "Penjual" in display messages

**File**: `scripts/migrate-full.ts` and `scripts/migrate-final.ts`

**Changes**:
1. **Update Enum Values**: Change `['user', 'admin', 'bandar']` to `['user', 'admin', 'penjual']`

**File**: `prisma/seed.ts`

**Changes**:
1. **Update Role Assignment**: Change `role: 'bandar'` to `role: 'penjual'`

**File**: `test-check-role-api.ts`

**Changes**:
1. **Update Variable Names**: Change `isBandar` to `isPenjual` throughout
2. **Update Role Check**: Change `role: 'bandar'` to `role: 'penjual'`
3. **Update Console Logs**: Change display text from "BANDAR" to "PENJUAL"

**File**: `PERBAIKAN_ADMIN_ACCESS.md`

**Changes**:
1. **Update Documentation**: Change `isBandar()` references to `isPenjual()`
2. **Update Example JSON**: Change `"isBandar": false` to `"isPenjual": false`

**File**: `database-fixes/README.md`

**Changes**:
1. **Update Table**: Change enum values from `user, admin, bandar` to `user, admin, penjual`

**Database Migration**:
1. **Create Migration Script**: Add new enum value 'penjual' to app_role enum
2. **Update Existing Records**: Update all user_roles records where role = 'bandar' to role = 'penjual'
3. **Remove Old Value**: Remove 'bandar' from the enum (optional, can be done later for safety)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, verify the current "bandar" terminology exists in all expected locations on unfixed code, then verify the fix correctly renames everything to "penjual" while preserving all role functionality.

### Exploratory Bug Condition Checking

**Goal**: Surface all locations where "bandar" terminology exists BEFORE implementing the fix. Confirm the scope of changes needed.

**Test Plan**: Search the codebase for all occurrences of "bandar" in code, configuration, and database. Document each location and its context. Run existing tests to establish baseline behavior.

**Test Cases**:
1. **Database Schema Check**: Verify app_role enum contains 'bandar' (will find on unfixed code)
2. **TypeScript Function Check**: Verify `isBandar()` function exists in checkRole.ts (will find on unfixed code)
3. **API Response Check**: Call `/api/auth/check-role` and verify response contains `isBandar` field (will find on unfixed code)
4. **Database Records Check**: Query user_roles table for records with role = 'bandar' (will find on unfixed code)
5. **UI Display Check**: Verify admin interface shows "bandar" in role options (will find on unfixed code)

**Expected Counterexamples**:
- Grep search for "bandar" returns matches in schema files, TypeScript files, scripts, and documentation
- Database query `SELECT * FROM user_roles WHERE role = 'bandar'` returns existing seller users
- API response includes `"isBandar": true` for seller users

### Fix Checking

**Goal**: Verify that for all locations where the bug condition holds (references to "bandar"), the fixed system uses "penjual" instead.

**Pseudocode:**
```
FOR ALL codeLocation WHERE isBugCondition(codeLocation) DO
  content := readFile(codeLocation.file)
  ASSERT content DOES NOT CONTAIN 'bandar' (except in comments/history)
  ASSERT content CONTAINS 'penjual' in appropriate context
END FOR
```

**Test Cases**:
1. **Schema Verification**: Verify Prisma schema and SQL files reference 'penjual' not 'bandar'
2. **Function Verification**: Verify `isPenjual()` function exists and `isBandar()` does not
3. **Type Verification**: Verify TypeScript types use 'penjual' in role unions
4. **Database Verification**: Verify no user_roles records have role = 'bandar', all are 'penjual'
5. **API Verification**: Verify API responses use `isPenjual` field name

### Preservation Checking

**Goal**: Verify that for all role-based functionality, the behavior remains identical after the terminology change.

**Pseudocode:**
```
FOR ALL user WHERE user.hasRole('penjual') DO
  permissions_before := getUserPermissions_original(user)
  permissions_after := getUserPermissions_fixed(user)
  ASSERT permissions_before = permissions_after
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It can generate test cases for users with different role combinations
- It catches edge cases in permission checking logic
- It provides strong guarantees that authorization behavior is unchanged

**Test Plan**: Before the fix, document the exact permissions and access rights for users with the "bandar" role. After the fix, verify users with the "penjual" role have identical permissions.

**Test Cases**:
1. **Permission Preservation**: Verify seller users can access the same routes and features after rename
2. **Authentication Preservation**: Verify existing sessions remain valid without re-login
3. **Query Preservation**: Verify database queries filtering by role return the same users
4. **Admin Role Preservation**: Verify admin role functionality is completely unaffected
5. **User Role Preservation**: Verify regular user role functionality is completely unaffected

### Unit Tests

- Test `isPenjual()` function returns true for users with penjual role
- Test `checkUserRole(userId, 'penjual')` returns correct boolean
- Test role assignment creates user_roles record with role = 'penjual'
- Test role removal deletes correct user_roles record
- Test API endpoint returns `isPenjual` field correctly

### Property-Based Tests

- Generate random user IDs and verify `isPenjual()` returns consistent results
- Generate random role combinations and verify permission checks work correctly
- Test that renaming does not affect users with admin or user roles
- Verify all database queries filtering by role return expected results

### Integration Tests

- Test full authentication flow for seller users after terminology change
- Test admin panel role assignment UI with new "penjual" terminology
- Test API endpoints that return role information use correct field names
- Test that existing seller users can log in and access their features without issues
- Test role-based route guards continue to work correctly
