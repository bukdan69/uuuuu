# Requirements Document

## Introduction

This document specifies the requirements for a marketplace banner administration interface that enables administrators to create, manage, and monitor banner advertisements displayed on the marketplace page. The system will provide controls for uploading banner images, configuring campaigns with budgets and schedules, and viewing performance metrics.

## Glossary

- **Admin_Interface**: The web-based administrative dashboard at `/admin/banners`
- **Banner**: A visual advertisement displayed at specific positions on the marketplace page
- **Banner_Position**: A designated location on the marketplace page where banners can be displayed (marketplace-top, marketplace-inline, marketplace-sidebar)
- **Banner_Campaign**: A scheduled advertising campaign with defined start/end dates, budget, and status
- **Banner_Image**: The visual asset uploaded by administrators for display in banner positions
- **Performance_Metrics**: Quantitative data tracking banner effectiveness (impressions, clicks, CTR, budget spent)
- **Banner_Status**: The operational state of a banner (pending, active, paused, expired)
- **Image_Validation**: The process of verifying uploaded images meet dimension and aspect ratio requirements
- **Budget_Tracking**: The system for monitoring campaign spending against allocated budget
- **Database**: The existing Prisma database containing Banner, BannerEvent, Sponsor, CarouselConfig, and AdminLog tables

## Requirements

### Requirement 1: Banner Creation and Upload

**User Story:** As an administrator, I want to create new banner campaigns with image uploads, so that I can advertise products and services on the marketplace.

#### Acceptance Criteria

1. WHEN an administrator accesses `/admin/banners`, THE Admin_Interface SHALL display a banner creation form
2. THE Admin_Interface SHALL provide input fields for title, target URL, position selection, start date, end date, and budget
3. WHEN an administrator selects a Banner_Position, THE Admin_Interface SHALL display the required image dimensions and aspect ratio
4. THE Admin_Interface SHALL accept image uploads in JPEG, PNG, and WebP formats
5. WHEN an image is uploaded for marketplace-top position, THE Image_Validation SHALL verify the image is 1200x150 pixels with 8:1 aspect ratio
6. WHEN an image is uploaded for marketplace-inline position, THE Image_Validation SHALL verify the image is 1200x150 pixels with 8:1 aspect ratio
7. WHEN an image is uploaded for marketplace-sidebar position, THE Image_Validation SHALL verify the image is 300x150 pixels with 2:1 aspect ratio
8. IF an uploaded image does not match the required dimensions, THEN THE Image_Validation SHALL return an error message specifying the correct dimensions
9. WHEN a valid banner is submitted, THE Admin_Interface SHALL save the banner to the Database with status "pending"
10. WHEN a banner is successfully created, THE Admin_Interface SHALL display a success confirmation message

### Requirement 2: Banner Management and Status Control

**User Story:** As an administrator, I want to manage existing banner campaigns and control their status, so that I can activate, pause, or deactivate advertisements as needed.

#### Acceptance Criteria

1. THE Admin_Interface SHALL display a list of all Banner_Campaigns with their current status, dates, and performance metrics
2. WHEN an administrator views the banner list, THE Admin_Interface SHALL show title, position, status, start date, end date, impressions, clicks, and budget spent for each banner
3. THE Admin_Interface SHALL provide action buttons to activate, pause, or expire banners
4. WHEN an administrator clicks activate on a pending banner, THE Admin_Interface SHALL update the Banner_Status to "active"
5. WHEN an administrator clicks pause on an active banner, THE Admin_Interface SHALL update the Banner_Status to "paused"
6. WHEN an administrator clicks expire on any banner, THE Admin_Interface SHALL update the Banner_Status to "expired"
7. WHILE a banner has status "active", THE Admin_Interface SHALL display it in the marketplace at the specified position
8. WHILE a banner has status "paused" or "expired", THE Admin_Interface SHALL not display it in the marketplace
9. THE Admin_Interface SHALL provide an edit function to modify banner details except the image
10. WHEN an administrator edits a banner, THE Admin_Interface SHALL update the Database and log the change in AdminLog

### Requirement 3: Performance Metrics and Analytics

**User Story:** As an administrator, I want to view banner performance metrics, so that I can evaluate campaign effectiveness and ROI.

#### Acceptance Criteria

1. THE Admin_Interface SHALL display Performance_Metrics for each banner including total impressions, total clicks, and click-through rate (CTR)
2. THE Admin_Interface SHALL calculate CTR as (clicks / impressions) × 100
3. THE Admin_Interface SHALL display budget spent and remaining budget for each campaign
4. WHEN an administrator views a banner's details, THE Admin_Interface SHALL show a performance summary with impressions, clicks, CTR, and budget metrics
5. THE Admin_Interface SHALL provide date range filters to view metrics for specific time periods
6. THE Admin_Interface SHALL display performance data in a tabular format with sortable columns
7. WHEN an administrator sorts by any metric column, THE Admin_Interface SHALL reorder the banner list accordingly
8. THE Admin_Interface SHALL retrieve Performance_Metrics from BannerEvent records in the Database
9. THE Admin_Interface SHALL update displayed metrics in real-time when the page is refreshed
10. THE Admin_Interface SHALL display a visual indicator when a campaign budget is 80% or more spent

### Requirement 4: Budget and Schedule Management

**User Story:** As an administrator, I want to set and monitor campaign budgets and schedules, so that I can control advertising costs and timing.

#### Acceptance Criteria

1. WHEN creating a banner, THE Admin_Interface SHALL require a start date and total budget amount
2. THE Admin_Interface SHALL allow an optional end date for campaigns
3. WHEN a banner's start date is in the future, THE Banner_Status SHALL remain "pending"
4. WHEN the current date reaches a banner's start date, THE Banner_Status SHALL automatically change to "active"
5. IF an end date is specified and the current date exceeds it, THEN THE Banner_Status SHALL automatically change to "expired"
6. THE Budget_Tracking SHALL increment budgetSpent in the Database when banner events occur
7. WHEN budgetSpent reaches or exceeds budgetTotal, THE Banner_Status SHALL automatically change to "paused"
8. THE Admin_Interface SHALL display a warning when creating a campaign with an end date before the start date
9. THE Admin_Interface SHALL validate that budget amounts are positive numbers greater than zero
10. WHEN an administrator updates a campaign budget, THE Admin_Interface SHALL log the change in AdminLog with previous and new values

### Requirement 5: Image Management and Validation

**User Story:** As an administrator, I want proper image validation and management, so that banners display correctly across all positions.

#### Acceptance Criteria

1. THE Image_Validation SHALL check image file size and reject files larger than 5MB
2. WHEN an image is uploaded, THE Image_Validation SHALL verify the file is a valid image format
3. THE Admin_Interface SHALL display a preview of the uploaded Banner_Image before submission
4. THE Admin_Interface SHALL show dimension requirements prominently next to the upload field
5. WHEN validation fails, THE Admin_Interface SHALL display specific error messages indicating the issue
6. THE Admin_Interface SHALL store uploaded images in the existing storage system used by the platform
7. WHEN a banner is deleted, THE Admin_Interface SHALL remove the associated Banner_Image from storage
8. THE Admin_Interface SHALL support replacing an existing banner image while maintaining the same campaign
9. WHEN an image is replaced, THE Image_Validation SHALL apply the same dimension requirements as initial upload
10. THE Admin_Interface SHALL display the current image thumbnail in the banner list view

### Requirement 6: Position-Specific Banner Display

**User Story:** As an administrator, I want to control which banners appear in each marketplace position, so that I can optimize ad placement and user experience.

#### Acceptance Criteria

1. THE Admin_Interface SHALL allow filtering the banner list by Banner_Position
2. WHEN multiple active banners exist for the same position, THE Admin_Interface SHALL display them in rotation
3. THE Admin_Interface SHALL provide a priority or sort order field for banners in the same position
4. WHEN displaying banners on the marketplace, THE system SHALL respect the priority order for rotation
5. THE Admin_Interface SHALL show how many active banners exist for each position
6. THE Admin_Interface SHALL warn administrators when no active banners exist for a position
7. WHEN creating a banner, THE Admin_Interface SHALL show example placements for each position option
8. THE Admin_Interface SHALL display position-specific statistics (total impressions and clicks per position)
9. THE Admin_Interface SHALL allow administrators to preview how a banner will appear in its position
10. WHEN a banner is set to marketplace-inline position, THE Admin_Interface SHALL indicate it appears every 12 listings

### Requirement 7: Administrative Logging and Audit Trail

**User Story:** As a system administrator, I want all banner management actions logged, so that I can maintain an audit trail and track changes.

#### Acceptance Criteria

1. WHEN an administrator creates a banner, THE Admin_Interface SHALL log the action to AdminLog with banner details
2. WHEN an administrator updates a banner, THE Admin_Interface SHALL log the action to AdminLog with changed fields
3. WHEN an administrator changes a Banner_Status, THE Admin_Interface SHALL log the status change to AdminLog
4. WHEN an administrator deletes a banner, THE Admin_Interface SHALL log the deletion to AdminLog with banner ID and title
5. THE Admin_Interface SHALL record the administrator's user ID for all logged actions
6. THE Admin_Interface SHALL record the IP address for all logged actions
7. THE Admin_Interface SHALL store action details as JSON in the AdminLog details field
8. THE Admin_Interface SHALL include timestamp information for all logged actions
9. THE Admin_Interface SHALL provide a view of recent banner-related actions in the activity log
10. WHEN viewing the activity log, THE Admin_Interface SHALL display administrator name, action type, target banner, and timestamp

### Requirement 8: Access Control and Permissions

**User Story:** As a system administrator, I want to restrict banner management to authorized administrators, so that I can maintain security and prevent unauthorized changes.

#### Acceptance Criteria

1. WHEN a non-administrator user attempts to access `/admin/banners`, THE Admin_Interface SHALL redirect to the login page
2. THE Admin_Interface SHALL verify the user has administrator role before displaying any banner management features
3. WHEN an unauthorized user attempts to access banner management APIs, THE system SHALL return a 403 Forbidden error
4. THE Admin_Interface SHALL use the existing authentication system implemented in the platform
5. THE Admin_Interface SHALL display the current administrator's name in the interface header
6. WHEN an administrator's session expires, THE Admin_Interface SHALL redirect to the login page
7. THE Admin_Interface SHALL validate administrator permissions on every API request
8. THE Admin_Interface SHALL log failed access attempts to AdminLog
9. THE Admin_Interface SHALL integrate with the existing admin layout and navigation
10. THE Admin_Interface SHALL appear in the admin sidebar navigation menu as "Banner Ads"
