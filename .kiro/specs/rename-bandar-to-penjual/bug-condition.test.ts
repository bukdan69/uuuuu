/**
 * Bug Condition Exploration Test for Rename Bandar to Penjual
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test verifies that "bandar" terminology exists throughout the system.
 * When run on UNFIXED code, it will FAIL and document all locations where
 * "bandar" appears. After the fix is implemented, this same test will PASS,
 * confirming that all references have been changed to "penjual".
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Bug Condition: All References Should Use "Penjual" (Not "Bandar")', () => {
  const projectRoot = process.cwd();

  /**
   * Property 1: Bug Condition - All References Use "Penjual"
   * 
   * For any code location, database value, or UI text where the seller role
   * is referenced, the system SHALL use "penjual" instead of "bandar".
   */

  it('should use "penjual" in Prisma schema UserRole model comment', () => {
    const schemaPath = join(projectRoot, 'prisma', 'schema.prisma');
    expect(existsSync(schemaPath), 'Prisma schema file should exist').toBe(true);
    
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    
    // The comment should reference 'penjual' not 'bandar'
    const userRoleModelMatch = schemaContent.match(/model UserRole\s*{[^}]*role\s+String[^}]*\/\/[^}]*}/s);
    expect(userRoleModelMatch, 'UserRole model should exist').toBeTruthy();
    
    const userRoleSection = userRoleModelMatch![0];
    
    // After fix: should contain 'penjual' in comment
    expect(userRoleSection).toContain('penjual');
    
    // After fix: should NOT contain 'bandar' in comment
    expect(userRoleSection).not.toContain('bandar');
  });

  it('should have isPenjual() function (not isBandar()) in checkRole.ts', () => {
    const checkRolePath = join(projectRoot, 'src', 'lib', 'auth', 'checkRole.ts');
    expect(existsSync(checkRolePath), 'checkRole.ts file should exist').toBe(true);
    
    const checkRoleContent = readFileSync(checkRolePath, 'utf-8');
    
    // After fix: should have isPenjual function
    expect(checkRoleContent).toContain('function isPenjual()');
    
    // After fix: should NOT have isBandar function
    expect(checkRoleContent).not.toContain('function isBandar()');
    
    // After fix: function should check for 'penjual' role
    expect(checkRoleContent).toContain("checkUserRole(user.id, 'penjual')");
    
    // After fix: should NOT check for 'bandar' role
    expect(checkRoleContent).not.toContain("checkUserRole(user.id, 'bandar')");
  });

  it('should use "penjual" in TypeScript type definitions in supabase.ts', () => {
    const supabasePath = join(projectRoot, 'src', 'lib', 'supabase.ts');
    expect(existsSync(supabasePath), 'supabase.ts file should exist').toBe(true);
    
    const supabaseContent = readFileSync(supabasePath, 'utf-8');
    
    // After fix: app_role enum should include 'penjual'
    const appRoleMatch = supabaseContent.match(/app_role:\s*['"]user['"]\s*\|\s*['"]admin['"]\s*\|\s*['"](\w+)['"]/);
    expect(appRoleMatch, 'app_role enum should exist').toBeTruthy();
    expect(appRoleMatch![1]).toBe('penjual');
    
    // After fix: should NOT contain 'bandar' in role types
    const roleTypeMatches = supabaseContent.match(/['"]user['"]\s*\|\s*['"]admin['"]\s*\|\s*['"]bandar['"]/g);
    expect(roleTypeMatches).toBeNull();
  });

  it('should use "penjual" in API endpoint check-role route', () => {
    const apiRoutePath = join(projectRoot, 'src', 'app', 'api', 'auth', 'check-role', 'route.ts');
    expect(existsSync(apiRoutePath), 'check-role route should exist').toBe(true);
    
    const apiRouteContent = readFileSync(apiRoutePath, 'utf-8');
    
    // After fix: should have isPenjual variable
    expect(apiRouteContent).toContain('isPenjual');
    
    // After fix: should NOT have isBandar variable
    expect(apiRouteContent).not.toContain('isBandar');
    
    // After fix: should check for 'penjual' role
    expect(apiRouteContent).toContain("'penjual'");
    
    // After fix: should NOT check for 'bandar' role
    expect(apiRouteContent).not.toContain("'bandar'");
  });

  it('should use "penjual" in administrative scripts', () => {
    const scriptsToCheck = [
      'scripts/assign-role.ts',
      'scripts/remove-role.ts',
      'scripts/list-all-roles.ts'
    ];
    
    for (const scriptPath of scriptsToCheck) {
      const fullPath = join(projectRoot, scriptPath);
      
      if (existsSync(fullPath)) {
        const scriptContent = readFileSync(fullPath, 'utf-8');
        
        // After fix: should reference 'penjual'
        expect(scriptContent, `${scriptPath} should contain 'penjual'`).toContain('penjual');
        
        // After fix: should NOT reference 'bandar' (except in comments about migration)
        const bandarMatches = scriptContent.match(/['"]bandar['"]/g);
        expect(bandarMatches, `${scriptPath} should not contain 'bandar' in code`).toBeNull();
      }
    }
  });

  it('should use "penjual" in database schema SQL files', () => {
    const sqlFiles = [
      'database-fixes/migration_to_supabase_part1.sql',
      'database-fixes/schema_complete_fixed.sql'
    ];
    
    for (const sqlFile of sqlFiles) {
      const fullPath = join(projectRoot, sqlFile);
      
      if (existsSync(fullPath)) {
        const sqlContent = readFileSync(fullPath, 'utf-8');
        
        // After fix: app_role enum should include 'penjual'
        const enumMatch = sqlContent.match(/CREATE\s+TYPE\s+(?:public\.)?app_role\s+AS\s+ENUM\s*\([^)]+\)/i);
        
        if (enumMatch) {
          const enumDef = enumMatch[0];
          
          // After fix: should contain 'penjual'
          expect(enumDef, `${sqlFile} enum should contain 'penjual'`).toContain('penjual');
          
          // After fix: should NOT contain 'bandar'
          expect(enumDef, `${sqlFile} enum should not contain 'bandar'`).not.toContain('bandar');
        }
      }
    }
  });

  it('should use "penjual" in seed data', () => {
    const seedPath = join(projectRoot, 'prisma', 'seed.ts');
    
    if (existsSync(seedPath)) {
      const seedContent = readFileSync(seedPath, 'utf-8');
      
      // After fix: role assignments should use 'penjual'
      const roleAssignments = seedContent.match(/role:\s*['"](\w+)['"]/g);
      
      if (roleAssignments) {
        const hasBandar = roleAssignments.some(assignment => assignment.includes('bandar'));
        const hasPenjual = roleAssignments.some(assignment => assignment.includes('penjual'));
        
        // After fix: should have 'penjual' assignments
        expect(hasPenjual, 'seed.ts should assign penjual role').toBe(true);
        
        // After fix: should NOT have 'bandar' assignments
        expect(hasBandar, 'seed.ts should not assign bandar role').toBe(false);
      }
    }
  });

  it('should use "penjual" in test files', () => {
    const testFiles = [
      'test-check-role-api.ts'
    ];
    
    for (const testFile of testFiles) {
      const fullPath = join(projectRoot, testFile);
      
      if (existsSync(fullPath)) {
        const testContent = readFileSync(fullPath, 'utf-8');
        
        // After fix: should reference 'penjual'
        expect(testContent, `${testFile} should contain 'penjual'`).toContain('penjual');
        
        // After fix: should NOT reference 'bandar'
        expect(testContent, `${testFile} should not contain 'bandar'`).not.toContain('bandar');
      }
    }
  });

  it('should use "penjual" in documentation', () => {
    const docFiles = [
      'PERBAIKAN_ADMIN_ACCESS.md',
      'database-fixes/README.md'
    ];
    
    for (const docFile of docFiles) {
      const fullPath = join(projectRoot, docFile);
      
      if (existsSync(fullPath)) {
        const docContent = readFileSync(fullPath, 'utf-8');
        
        // After fix: should reference 'penjual'
        expect(docContent, `${docFile} should contain 'penjual'`).toContain('penjual');
        
        // After fix: should NOT reference 'bandar' (except in historical context)
        // We'll check for code/API references specifically
        const codeReferences = docContent.match(/`[^`]*bandar[^`]*`/g);
        expect(codeReferences, `${docFile} should not have 'bandar' in code references`).toBeNull();
      }
    }
  });
});
