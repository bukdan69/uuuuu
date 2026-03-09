# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Status Updates Fail or UI Doesn't Refresh
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test concrete failing cases - status update button clicks and banner edits
  - Test that status updates via Play/Pause buttons succeed and UI refreshes immediately
  - Test that banner edits via dialog succeed and UI shows updated data immediately
  - Test cases: Click "Pause" on active banner, edit banner title and save, rapid status changes
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "Status update returns 404", "UI shows stale data after edit")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Update Operations Continue Working
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy operations (create, delete, generate, reset, upload)
  - Write property-based tests capturing observed behavior patterns:
    - Banner creation via "Tambah Banner" works and refreshes list
    - Banner deletion works and refreshes list
    - "Generate Semua Banner" creates 8 default banners
    - "Reset & Generate Ulang" deletes and recreates banners
    - Image upload and preview functionality works
    - Banner list displays all columns correctly
    - All validation rules (file size, type, budget, required fields) work
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix for banner admin status update and UI refresh issues

  - [x] 3.1 Implement the fix in updateStatus function
    - Change API endpoint from `/api/admin/banners/${id}/status` to `/api/admin/banners/${id}`
    - Add try-catch error handling with toast notifications
    - Ensure `fetchBanners()` is properly awaited after successful update
    - Add loading state to prevent duplicate requests
    - Show visual feedback (spinner) during updates
    - _Bug_Condition: isBugCondition(input) where input.action == 'status_update' OR input.action == 'banner_edit'_
    - _Expected_Behavior: updateSucceeds(result) AND uiRefreshesImmediately(result)_
    - _Preservation: All non-update operations (create, delete, generate, reset, upload, view) produce same behavior_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.2 Verify handleSave properly refreshes UI
    - Confirm `fetchBanners()` is called after successful save
    - Ensure refresh is not being skipped in any code path
    - Consider optimistic UI updates for better UX
    - _Requirements: 2.2, 2.3_

  - [ ] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Status Updates Succeed and UI Refreshes
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify status updates succeed and UI reflects changes within 1 second
    - Verify banner edits succeed and all fields update in UI
    - Verify error messages appear when API calls fail
    - Verify loading states prevent duplicate requests
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Update Operations Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all non-update operations still work exactly as before
    - Verify create, delete, generate, reset, upload, and display functionality unchanged

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
