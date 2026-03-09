# Bugfix Requirements Document

## Introduction

The system currently uses the term "bandar" for the seller/merchant role throughout the codebase. This is incorrect terminology in Indonesian. "Bandar" typically refers to a gambling operator or bookmaker, which is inappropriate for a marketplace seller role. The correct and professional term is "penjual" (seller/merchant).

This bug affects multiple layers of the application:
- Database schema (Prisma Role enum)
- TypeScript type definitions and function names
- UI labels and display text
- API endpoints and responses
- Administrative scripts

The fix ensures consistent, professional, and culturally appropriate terminology throughout the system.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the system defines user roles in the database schema THEN it uses "BANDAR" as an enum value instead of "PENJUAL"

1.2 WHEN TypeScript code checks for seller role permissions THEN it uses function names like "isBandar()" instead of "isPenjual()"

1.3 WHEN the admin interface displays role options THEN it shows "bandar" as a selectable role label instead of "penjual"

1.4 WHEN API endpoints return role information THEN they return "bandar" in the response payload instead of "penjual"

1.5 WHEN administrative scripts assign or check roles THEN they reference "bandar" instead of "penjual"

1.6 WHEN UI components display user roles THEN they show "bandar" text instead of "penjual"

### Expected Behavior (Correct)

2.1 WHEN the system defines user roles in the database schema THEN it SHALL use "PENJUAL" as the enum value for seller/merchant roles

2.2 WHEN TypeScript code checks for seller role permissions THEN it SHALL use function names like "isPenjual()" for clarity and correctness

2.3 WHEN the admin interface displays role options THEN it SHALL show "penjual" as the selectable role label

2.4 WHEN API endpoints return role information THEN they SHALL return "penjual" in the response payload

2.5 WHEN administrative scripts assign or check roles THEN they SHALL reference "penjual" consistently

2.6 WHEN UI components display user roles THEN they SHALL show "penjual" text with proper capitalization

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the system handles "user" role THEN it SHALL CONTINUE TO function identically with all existing permissions and behaviors

3.2 WHEN the system handles "admin" role THEN it SHALL CONTINUE TO function identically with all existing permissions and behaviors

3.3 WHEN existing users with the seller role access the system THEN they SHALL CONTINUE TO have the same permissions and access rights after the terminology change

3.4 WHEN role-based access control checks are performed THEN they SHALL CONTINUE TO enforce the same security rules and authorization logic

3.5 WHEN database queries filter by role THEN they SHALL CONTINUE TO return the correct users (those who were previously "bandar" should now be "penjual")

3.6 WHEN the authentication system validates user sessions THEN it SHALL CONTINUE TO work without requiring users to re-authenticate

3.7 WHEN role assignment and removal operations are performed THEN they SHALL CONTINUE TO work with the same administrative workflows
