# Bugfix Requirements Document

## Introduction

The banner admin page at `/admin/banners` has critical functionality issues preventing banner updates and status changes. Users report that banner updates fail and the display does not reflect changes after editing. The root cause is a missing API endpoint for status updates (`/api/admin/banners/[id]/status`) that the admin page attempts to call, causing status change operations to fail silently. Additionally, after successful updates via the PATCH endpoint, the UI may not be refreshing properly to show the changes.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN admin clicks Play/Pause buttons to change banner status THEN the system calls a non-existent `/api/admin/banners/[id]/status` endpoint and fails silently

1.2 WHEN admin successfully updates a banner via the edit dialog THEN the system may not refresh the banner list, causing the display to show stale data

1.3 WHEN admin edits a banner and saves changes THEN the updated data may not be immediately visible in the admin table

### Expected Behavior (Correct)

2.1 WHEN admin clicks Play/Pause buttons to change banner status THEN the system SHALL successfully update the banner status using the existing PATCH endpoint at `/api/admin/banners/[id]`

2.2 WHEN admin successfully updates a banner via the edit dialog THEN the system SHALL immediately refresh the banner list to display the updated data

2.3 WHEN admin edits a banner and saves changes THEN the system SHALL show the updated information in the admin table without requiring a page reload

### Unchanged Behavior (Regression Prevention)

3.1 WHEN admin creates a new banner THEN the system SHALL CONTINUE TO create the banner successfully and refresh the list

3.2 WHEN admin deletes a banner THEN the system SHALL CONTINUE TO delete the banner successfully and refresh the list

3.3 WHEN admin generates default banners THEN the system SHALL CONTINUE TO create 8 default banners for all positions

3.4 WHEN admin resets and regenerates banners THEN the system SHALL CONTINUE TO delete old banners and create new ones

3.5 WHEN admin uploads a banner image THEN the system SHALL CONTINUE TO upload and preview the image correctly

3.6 WHEN admin views the banner list THEN the system SHALL CONTINUE TO display all banner information including preview, title, position, status, impressions, clicks, CTR, and budget
