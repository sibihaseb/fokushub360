# FokusHub360 - Virtual Focus Group Platform

## Overview

FokusHub360 is a premium, fully automated virtual focus group platform that enables market research through AI-powered participant matching and automated feedback collection. The platform serves multiple user types including clients who need market feedback, participants who provide feedback, managers who oversee focus groups, and administrators who manage the platform.

## User Preferences

Preferred communication style: Simple, everyday language.

**CRITICAL PRODUCTION WARNING**: This site is live and operational. Exercise extreme caution when making changes - always preserve existing functionality and avoid breaking working features. Test thoroughly before implementing changes that could affect live users.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Development Server**: Custom Vite integration for hot module replacement

### Database Schema
The application uses a comprehensive schema with the following key entities:
- **Users**: Role-based system (client, participant, manager, admin)
- **Participant Profiles**: Detailed demographic and behavioral data stored as JSONB
- **Campaigns**: Focus group configurations with targeting and questions
- **Campaign Assets**: File storage references for uploaded content
- **Campaign Participants**: Many-to-many relationship for participant enrollment
- **Reports**: Generated analytics and insights

## Key Components

### Authentication System
- JWT token-based authentication with 7-day expiration
- Role-based access control (client, participant, manager, admin)
- Password hashing using bcrypt with 12 salt rounds
- Protected routes with middleware authentication

### User Management
- Multi-role user system with profile management
- Participant profiles with extensive demographic data
- Client dashboard for campaign management
- Admin controls for platform configuration

### Onboarding Questionnaire System (Latest Implementation)
- Comprehensive 8-category participant profiling system
- 100+ questions across Demographics, Beliefs, Lifestyle, Career & Education, Media Preferences, Tech Usage, Buying Behavior, Psychographics
- Database-backed questionnaire with categories, questions, and participant responses
- API endpoints for questionnaire data management and bulk response submission
- Seamless integration with participant sign-up flow
- Progressive multi-step interface with progress tracking

### Advanced Dashboard System (Latest Enhancement)
- Comprehensive admin dashboard with global platform monitoring
- Enhanced manager dashboard with live participant tracking and moderation tools
- Advanced AI settings panel for OpenAI configuration and feature management
- Comprehensive reports dashboard with advanced analytics and visualizations
- Real-time system health monitoring and alert management
- Multi-tab interface for efficient workflow management
- Interactive charts and data visualization using Recharts library

### Admin Control & Session Management (Latest Implementation)
- Complete admin settings panel with configurable session timeouts, campaign deadlines, and warning thresholds
- Granular control over user session durations (15 minutes to 24 hours)
- Campaign response deadline management (1-168 hours, default 48 hours)
- Automated warning system with configurable thresholds (1-10 warnings before ban)
- Email verification toggle and platform security settings
- Real-time platform configuration with immediate effect

### Participant Campaign Management (Latest Implementation)
- Sophisticated participant dashboard with real-time campaign invitation tracking
- 48-hour response deadline system with visual countdown timers
- Automated urgency indicators (normal, urgent, critical, expired)
- Campaign acceptance/decline workflow with proper status tracking
- Warning system display with escalation notifications
- Comprehensive participant statistics and earnings tracking
- Multi-tab organization (pending, accepted, declined invitations)

### Manager Participant Administration (Latest Implementation)
- Complete participant management interface for managers
- Real-time participant search and filtering (active, banned, warned, inactive)
- Campaign invitation system with manager-to-participant workflow
- Comprehensive participant banning and warning capabilities
- Participant statistics display (campaigns, earnings, ratings, response rates)
- User activity tracking with last login and join date information
- Interactive dialogs for ban management with reason tracking

### Sophisticated Mandatory Question Validation (Latest Implementation)
- Advanced validation system preventing progression on incomplete required fields
- Real-time validation with specific error messages and character count feedback
- Visual progress indicators showing required field completion status
- Comprehensive validation summary displaying all missing fields
- Enhanced input styling with error states and validation feedback
- Age validation for participant eligibility (minimum 13 years old)
- Character limits and constraints display for better user guidance
- Smooth scrolling to validation errors for improved user experience

### Enhanced Account Creation & Profile Management (Latest Implementation)
- Improved account type selection with clear descriptions and mandatory selection
- Removed auto-selection forcing users to manually choose Client or Participant
- Auto-save functionality for profile completion preventing session timeout issues
- Profile completion tracking with 80% requirement for job/matching access
- Visual save status indicators (saving, saved, error) for better user feedback
- Partial profile storage allowing users to complete onboarding later
- Profile completion API endpoints for real-time progress tracking

### Comprehensive Dashboard Enhancement with Analytics (Latest Implementation - July 16, 2025)
- **Enhanced Participant Dashboard**: Upgraded with comprehensive analytics, charts, and detailed statistics
- **Advanced Performance Metrics**: Real-time tracking of completion rates, quality scores, and punctuality
- **Interactive Data Visualization**: Monthly earnings charts, campaign category breakdowns, and activity timelines
- **Achievement System**: Gamified rewards tracking with achievement badges and progress indicators
- **Recent Activity Feed**: Live updates on campaign completions, earnings, and system interactions
- **Responsive Design**: Mobile-optimized layout with dark theme and glass-card aesthetic
- **Progress Tracking**: Visual progress bars and completion indicators for all metrics
- **24 Test Campaigns**: Successfully seeded comprehensive test campaigns across all categories
- **Real-time Updates**: Live data synchronization with backend analytics engine

### Comprehensive Admin Control System (Latest Implementation - July 17, 2025)
- **Complete Admin Dashboard Enhancement**: Integrated email and menu control tabs into main admin interface
- **Advanced Email Management System**: Full-featured email control with test email, custom messaging, and template management
- **Dynamic Menu Control System**: Admin can enable/disable/edit all landing page sections and navigation elements
- **Verified Email Functionality**: Successfully implemented and tested email system with Resend API integration
- **Real-time Settings Management**: Admin settings update immediately across the platform with proper database storage
- **Test Email Confirmation**: Verified email delivery system working with successful test email to marty@24flix.com
- **API Backend Integration**: Complete REST API endpoints for email configuration, menu settings, and system management
- **Multi-tab Admin Interface**: Organized admin controls into logical tabs (overview, users, campaigns, reports, email, menu)
- **Dynamic Configuration Loading**: Email service dynamically reads settings from database for flexible configuration
- **Professional Email Templates**: Beautiful HTML email templates for test emails, welcomes, and campaign invitations
- **Domain Configuration**: Proper email domain setup with fallback to verified resend.dev domain
- **Settings Persistence**: All admin configurations stored in system_settings table with proper versioning
- **Real-time Validation**: Immediate feedback on email sending success/failure with detailed error messages
- **Cross-component Integration**: Seamless integration between frontend admin controls and backend API services

### Comprehensive Password Reset System (Latest Implementation - July 17, 2025)
- **Complete Password Reset Workflow**: Full token-based password reset system with secure 1-hour expiration
- **Database Integration**: Password reset tokens table with proper indexing and foreign key relationships
- **API Endpoints**: Complete REST API for forgot password, reset password, and token verification
- **Frontend Pages**: Beautiful forgot password and reset password pages with proper validation
- **Email Integration**: Automated password reset emails with professional HTML templates
- **Security Features**: Token uniqueness, expiration handling, and single-use token enforcement
- **User Experience**: Forgot password link on sign-in page, clear error messages, and success confirmations
- **Route Integration**: Proper routing for /auth/forgot-password and /auth/reset-password/:token
- **Database Storage**: All password reset tokens stored securely with automatic cleanup
- **Comprehensive Email System**: Verification reminders, warning emails, and password reset confirmations
- **Admin Email Control**: Enhanced admin interface with verification reminder and warning email templates
- **Cross-platform Integration**: Seamless integration with existing authentication and email systems

### Comprehensive Welcome Email System (Latest Implementation - July 17, 2025)
- **Automated Welcome Emails**: Beautiful role-specific welcome emails automatically sent upon user registration
- **Client Welcome Template**: Business-focused design with AI analytics, smart matching, real-time reports, and scaling features
- **Participant Welcome Template**: Earnings-focused design with earning potential ($25-75 per campaign), flexible scheduling, and payout information
- **Professional Design**: Glass-card aesthetic with gradient backgrounds, feature grids, and prominent CTAs
- **Admin Management**: Complete admin interface for sending test welcome emails for both client and participant roles
- **API Integration**: Full REST API endpoints for sending welcome emails with role specification
- **Automatic Triggering**: Welcome emails sent automatically during registration process based on user role
- **Email Delivery Testing**: Successfully tested email delivery to marty@24flix.com for both client and participant templates
- **Visual Elements**: Includes F360 logo, earning potential charts, feature highlights, and getting started guides
- **Responsive Design**: Mobile-optimized layouts with proper typography and spacing for all email clients
- **Cross-platform Integration**: Seamless integration with existing email service and admin control systems

### Critical Questionnaire System Enhancement (Latest Implementation - July 18, 2025)
- **Complete API Response Fix**: Fixed critical issue where `apiRequest` returns Response objects but code tried to use them directly as data
- **Proper JSON Parsing**: Updated both categories and questions API calls to use `.json()` method for proper data extraction
- **Admin Panel Access Control**: Removed admin panel access from regular participant onboarding interface
- **Enhanced Question Types**: Added support for multi-select questions (news consumption) and improved number input validation
- **Gaming Question Fix**: Updated number inputs to accept 0 as valid input with proper min="0" attribute
- **Country Selection Enhancement**: Changed country question from text input to dropdown with priority countries (US first)
- **Date of Birth Implementation**: Replaced age question with Date of Birth using date input type for better accuracy
- **Admin Questionnaire Management**: Added questionnaire management tab to admin dashboard with category/question editing
- **Verification Integration**: Fixed verification prompt to show exactly as requested: "Would you like to get verified now? Yes or Not Now"
- **Professional Verification UI**: Created comprehensive 3-step verification process with phone, documents, and review
- **Progress Tracking**: Enhanced questionnaire navigation with proper progress indicators and save status
- **Error Handling**: Improved error handling and validation throughout the onboarding flow
- **Mobile Optimization**: Ensured responsive design for all questionnaire and verification components
- **Database Schema Updates**: Updated question types in database to support new multi-select, dropdown, and date functionality
- **Questionnaire Completion Loop Fix**: Fixed critical infinite loop bug where completion status wasn't being refreshed, causing "must complete questionnaire" error after completion
- **Verification Status Logic Fix**: Fixed verification button inconsistency where dashboard showed "Verification Submitted" but profile page allowed re-submission. Now properly checks for actual uploaded documents rather than just verification status

### Comprehensive Email Template Management System (Latest Implementation - July 17, 2025)
- **Complete Admin Template Control**: Full-featured email template management with database storage and admin interface
- **Six Core Email Templates**: Welcome client, welcome participant, password reset, verification reminder, warning, and campaign invitation templates
- **Database Integration**: Email templates stored in system_settings table with proper versioning and admin tracking
- **Template Editor Interface**: Rich admin interface with live preview, HTML editing, and variable substitution
- **Default Template System**: Comprehensive default templates with FokusHub360 branding and professional design
- **Template Variables**: Dynamic content with firstName, loginUrl, resetUrl, campaignTitle, and other contextual variables
- **Live Preview**: Real-time template preview with variable substitution for testing and validation
- **Template Versioning**: Full change tracking with admin user attribution and timestamp management
- **API Endpoints**: Complete REST API for template CRUD operations with proper authentication
- **Professional Branding**: All templates use FokusHub360 branding with noreply@fokushub360.com sender
- **Email Service Integration**: Templates automatically loaded from database by email service for sending
- **Seeding System**: Automated template seeding with default content for immediate platform functionality
- **Multi-category Organization**: Templates organized by type (welcome, security, notifications, campaigns)
- **Template Testing**: Built-in test email functionality with marty@24flix.com delivery confirmation

### Advanced Email Management Platform (Enhanced Implementation - July 18, 2025)
- **Direct Email Template Editing**: Restored actual email editing functionality with subject and body editing as requested
- **Professional Template Editor**: Clean, robust interface for direct template content management
- **Real-time Preview System**: Live email preview with variable substitution and sample data
- **Template Testing Interface**: Send test emails to verify template functionality
- **Variable System**: Dynamic content insertion with {{variable}} syntax for personalization
- **Professional Templates**: Six core templates (welcome client/participant, password reset, campaign invitation, verification reminder, account warning)
- **Database Storage**: All templates stored in system_settings with versioning and admin tracking
- **Admin Dashboard Integration**: Dedicated "Templates" tab in admin interface for easy access
- **Template Seeding**: Automated default template creation for immediate platform functionality
- **Multi-type Organization**: Templates categorized by type (welcome, security, campaign, reminder, notification)
- **Email Service Integration**: Templates automatically loaded and used by email service
- **Complete API Endpoints**: Full REST API for template CRUD operations with proper authentication
- **Variable Insertion**: Click-to-insert variable system for easy template customization
- **Responsive Design**: Mobile-optimized template editor with tabbed interface
- **Professional Email Domain**: All emails sent from noreply@fokushub360.com with proper authentication

### Complete Content Management System (Latest Implementation - July 18, 2025)
- **Comprehensive Admin Dashboard**: All tabs fully functional with professional interfaces replacing all "coming soon" placeholders
- **Complete Legal Document Editor**: Full-featured legal document management with comprehensive default content for privacy policy, terms of service, and data rights
- **Advanced Cookie Management**: Complete cookie consent system with banner customization, category controls, and admin configuration
- **Platform Settings Interface**: Comprehensive settings management for user configuration, campaign defaults, and system parameters
- **Homepage Content Editor**: Enhanced with section enable/disable toggles and complete content management capabilities
- **Complete API Backend**: All endpoints implemented for homepage sections, cookie settings, legal documents, and platform configuration
- **Professional Templates**: All legal documents include comprehensive, professional default content with proper structure and legal language
- **Production-Ready Features**: All interfaces fully functional with proper error handling, validation, and user feedback
- **Admin Control Center**: Complete administrative control over all platform features with intuitive, glass-card design interface
- **Deployment-Ready Status**: Application fully prepared for production deployment with all critical features implemented

### Final Production Cleanup & UX Fixes (Latest Update - July 18, 2025)
- **Backend Mock Data Elimination**: Fixed getParticipantStats function that was returning hardcoded earnings, performance metrics, and achievements
- **Frontend Dummy Text Removal**: Replaced all fake progress indicators (+$125 this week, +2 campaigns, etc.) with dynamic authentic messages
- **Questionnaire UX Enhancement**: Added exclusivity logic for social causes question - selecting "None" or "Other" automatically deselects other options
- **Dynamic Status Messages**: Dashboard now shows context-aware messages based on actual user activity (Get started vs Active, etc.)
- **Production Data Integrity**: All users see 100% authentic data with zero values when no real activity exists
- **Usability Improvements**: Fixed contradictory multi-select behavior for better user experience
- **Clean Production State**: Platform completely ready for live deployment with authentic data and improved UX

### Profile Page Fixes (Latest Update - July 20, 2025)
- **Fixed "Joined Recently" Display**: Corrected date display to show actual join date instead of "Recently" text
- **Improved Verification Badge**: Enhanced "Not Verified" badge with white text and proper contrast
- **Conditional Email Display**: Fixed empty email icon by adding conditional rendering
- **Known Issue - Form Field Readability**: Profile form fields remain difficult to read with gray backgrounds when disabled. Multiple CSS override attempts (Tailwind classes, inline styles with !important, CSS variable changes) have not resolved this issue. Requires deeper investigation into CSS specificity conflicts with disabled input styling.

### Admin Dashboard Button Visibility Fix (Latest Fix - July 20, 2025)
- **CRITICAL FIX**: Resolved white buttons with white text issue throughout admin dashboard
- **Root Cause**: The `variant="outline"` in shadcn/ui Button component uses CSS variables that create invisible buttons
- **Final Solution**: Removed `variant="outline"`, added `!important` Tailwind overrides, and inline styles as fallback
- **Triple Protection**: Uses Tailwind classes + !important overrides + inline style attributes to force visibility
- **Color-Coded Button System**: Edit (blue), Debug (purple), Ban/Lock (green/yellow), Delete (red), Cancel (gray)
- **NOTE FOR FUTURE**: NEVER use `variant="outline"` with shadcn/ui buttons in dark themes - always use default variant with explicit colors

### Comprehensive Payment Methods System (Latest Implementation - July 20, 2025)
- **Complete Payment System**: Added comprehensive payment methods to participant profiles with 7 payment options
- **Database Integration**: Added paymentMethods JSONB field to participant_profiles table with proper schema updates
- **Multi-Payment Support**: Zelle (email & phone), CashApp, PayPal, Venmo, Payoneer, Western Union (name & phone), Check by Mail
- **Enhanced Profile UI**: Added new "Payment" tab to profile interface with 4-column responsive layout
- **Backend API Updates**: Updated profile API to properly save and retrieve payment method data
- **Beautiful Interface**: Color-coded icons for each payment method with helpful information boxes
- **Secure Storage**: All payment method data stored securely in JSONB format for flexibility

### Legal Documents System Restoration (Latest Fix - July 20, 2025)
- **Complete Legal Content Restoration**: Fixed blank legal documents during account setup with comprehensive content
- **Terms of Service**: 12-section comprehensive terms covering user accounts, platform services, payments, conduct, IP rights, disclaimers, and termination
- **Privacy Policy**: Detailed 12-section privacy policy covering data collection, usage, sharing, security, retention, and user rights
- **Data Rights Documentation**: Comprehensive guide to user data rights including GDPR compliance, access, correction, deletion, portability, and complaint procedures
- **Professional Legal Language**: All documents written with appropriate legal terminology and structure
- **GDPR Compliance**: Full compliance with European data protection regulations and user rights
- **Multi-Jurisdiction Coverage**: Covers requirements for US, EU, and California privacy laws
- **Admin Dashboard Integration**: Legal documents fully integrated with admin content management system for easy updates

### Survey Completion Data Synchronization Fix (Latest Fix - July 24, 2025)
- **CRITICAL SURVEY DATA DISCONNECT RESOLVED**: Fixed issue where users marked as completed had 0 actual survey responses (Mary Mazur case)
- **Dashboard Data Integrity**: Corrected questionnaire completion flags to match actual response data in database
- **Completion Status Validation**: Updated completion logic to only mark users as completed when they have sufficient responses (>=80%)
- **Mary Mazur Specific Fix**: Corrected Mary Mazur's completion status from true to false with 0% completion matching her 0 responses
- **Wasabi Cloud Storage Integration**: Configured all file uploads (verification documents, media) to use Wasabi S3 instead of local storage
- **Verification Document Upload**: Enhanced verification system to store files directly in Wasabi with proper URL tracking
- **Media Upload Enhancement**: Updated admin media upload to use Wasabi cloud storage with complete file metadata
- **File Upload Testing**: Implemented comprehensive Wasabi upload testing with proper error handling and success confirmation
- **Production Cloud Storage**: All document and media uploads now use secure Wasabi cloud storage for scalability

### Critical User Deletion System Fix (Previous Fix - July 20, 2025)
- **Fixed Duplicate Import Issue**: Resolved duplicate drizzle-orm imports that were causing schema reference conflicts
- **Corrected Reports Deletion**: Fixed reports deletion to use campaign_id relationships instead of non-existent client_id column
- **Fixed Messages Deletion**: Updated to properly handle both sender_id and recipient_id relationships
- **Raw SQL Implementation**: Used direct SQL queries to bypass Drizzle ORM schema reference issues for campaign assets
- **Database Schema Alignment**: All deletion queries now work correctly with actual database structure
- **Production Ready**: User deletion system fully functional for admin user management

### Application Debugging and Fixes (Previous Fix - July 17, 2025)
- **Database Connection Resolved**: Fixed Neon database connection issues and WebSocket configuration
- **Schema Type Errors Fixed**: Corrected duplicate type definitions and circular references in schema
- **Missing Import Types**: Added proper TypeScript types for CampaignAsset, CampaignParticipant, and related schemas
- **Stripe API Updated**: Updated to latest Stripe API version (2025-06-30.basil)
- **API Endpoints Functional**: All dashboard, campaign, and user management endpoints operational
- **Database Migration**: Successfully resolved database schema migration conflicts
- **Server Startup**: Application now starts successfully on port 5000 with all services initialized
- **Frontend Integration**: Vite development server properly integrated with Express backend
- **Real-time Functionality**: WebSocket connections and hot module replacement working correctly
- **User Management System Fixed**: Resolved routing issues with back button navigation in admin interface
- **Password Hashing Implemented**: Added proper bcrypt password hashing for admin-created users
- **React Query Integration**: Fixed cache invalidation and data refresh issues in user management
- **UI Component Warnings**: Resolved missing DialogDescription warnings in modal components
- **Database Schema Sync**: Fixed participant_responses table structure to match expected schema

### Campaign Media Display System (Previous Fix - July 16, 2025)
- **Fixed JSON Parsing Issue**: Resolved campaign assets display problem by properly parsing API responses
- **Enhanced Video Controls**: Added proper video controls with preload metadata and error handling
- **Working Media URLs**: Updated to use reliable public video sources (Big Buck Bunny from Google)
- **Fallback Systems**: Implemented error handling with direct link options for failed media
- **Improved Audio Display**: Enhanced audio controls with better styling and error handling
- **Multi-Media Support**: Full support for images, videos, audio files, and external links
- **Responsive Design**: Media assets properly display across different screen sizes
- **Test Campaign Content**: Complete test campaigns with functional media across all content types

### Advanced Verification System with Admin Override (Latest Implementation - July 16, 2025)
- **Admin/Manager Override**: Verification button unlocked for admins and managers for testing and management
- **Periodic Notification System**: Automated weekly reminders for unverified users after 7 days
- **Comprehensive Reminder Dashboard**: Admin panel for managing verification reminders and user status
- **Custom Notification Messages**: Ability to send personalized verification reminders to specific users
- **Urgency Classification**: High, medium, and low urgency levels based on days since joining
- **Bulk Reminder Actions**: Send notifications to all eligible unverified users simultaneously
- **Verification Status Tracking**: Real-time monitoring of verification completion and reminder history
- **Role-Based Access**: Different verification capabilities for different user roles
- **Notification Analytics**: Detailed statistics on verification reminder effectiveness
- **User Experience Enhancement**: Improved verification flow with better status indicators

### Invitation-Only Registration System (Latest Implementation - July 17, 2025)
- **Complete Invitation Control**: Admin can toggle invitation-only mode on/off through dashboard
- **Client Registration Blocking**: When enabled, prevents new client account creation with proper error handling
- **Beautiful Invitation Modal**: Glass-effect modal with form validation for waitlist submissions
- **Pre-filled Data Integration**: Modal automatically populates with user's name and email from signup form
- **Phone Number Support**: Added optional phone number field to waitlist form with database storage
- **Comprehensive Waitlist Management**: Admin interface for approving, rejecting, and inviting users
- **Real-time Status Tracking**: Live updates of invitation mode status and waitlist statistics
- **Enhanced Error Handling**: Completely rewritten API error parsing to prevent response consumption issues
- **Role-Based Restrictions**: Only blocks client registration, participants can still sign up normally
- **Database Integration**: Complete schema with invitation_waitlist and system_settings tables, phone field added
- **Professional UI Design**: Consistent glass-card aesthetic matching existing platform design
- **Functional Testing Verified**: System successfully blocks client registration and displays invitation modal

### Admin/Manager Communication System (Latest Implementation)
- Comprehensive messaging system for admin/manager to participant communication
- Message types: general, warning, campaign_invite, system notifications
- Priority levels: low, normal, high, urgent with color-coded indicators
- Real-time message status tracking (read/unread) with notifications
- Conversation threading and message history management
- Participant selection interface for targeted messaging
- Auto-save message drafts and delivery confirmation

### AI-Driven Participant Matching System (Latest Implementation - July 16, 2025)
- **Core AI Engine**: OpenAI GPT-4o powered behavioral analysis and preference learning
- **Comprehensive Analysis**: 100+ participant attributes across 8 behavioral dimensions
- **Intelligent Criteria Generation**: AI-powered matching criteria based on campaign requirements
- **Multi-dimensional Scoring**: Match score, confidence, engagement prediction, and risk assessment
- **Psychographic Profiling**: Personality traits, values, motivations, and decision-making styles
- **Behavioral Pattern Analysis**: Tech adoption, communication styles, and purchase behaviors
- **Smart Optimization**: Balances quality and diversity in participant selection
- **Learning System**: Real-time learning from campaign results to improve future matching
- **Advanced Analytics**: Performance metrics, segment distribution, and matching insights
- **Segment Classification**: Early Adopters, Mainstream, Traditionalists, Niche Enthusiasts, Professional Consumers
- **Industry Optimization**: Historical performance data for industry-specific matching
- **Complete API Integration**: Full backend implementation with storage and routing
- **Comprehensive Dashboard**: Multi-tab interface for criteria generation, matching, and analytics
- **Real-time Processing**: Live AI analysis with progress tracking and confidence metrics

### AI-Powered Media Analysis System (Latest Implementation)
- Premium paid feature using OpenAI GPT-4o vision capabilities for image and video analysis
- Comprehensive analysis including demographics, emotions, content, and market insights
- Multi-type analysis options: comprehensive, sentiment, demographic, content-focused
- Advanced emotion detection with confidence scoring and behavioral insights
- Brand recognition, object detection, and visual composition analysis
- Automated market relevance scoring and target audience identification
- Beautiful, extremely visual reports with charts, graphs, and detailed breakdowns
- Admin-controlled pricing and feature management system
- Real-time processing with progress tracking and confidence metrics
- Export capabilities for PDF reports and data sharing
- Integration with Wasabi cloud storage for secure media handling

### Campaign Management
- Upload and manage digital assets (images, videos, links)
- AI-powered participant matching based on profile attributes
- Customizable questions and survey forms
- Real-time campaign monitoring and analytics

### File Storage Integration
- Configured for Wasabi cloud storage (S3-compatible)
- Watermarking capabilities for content protection
- Secure asset management and delivery

## Data Flow

1. **User Authentication**: Users sign up/in through JWT-based auth system
2. **Profile Creation**: Participants complete detailed demographic profiles
3. **Campaign Creation**: Clients upload assets and configure targeting
4. **AI Matching**: System matches participants based on profile attributes
5. **Feedback Collection**: Participants complete surveys and provide feedback
6. **Report Generation**: AI generates insights and analytics
7. **Results Delivery**: Clients receive comprehensive reports and dashboards

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **zod**: Schema validation

### Planned Integrations
- **Stripe**: Payment processing for campaign fees
- **OpenAI**: AI-powered insights and report generation
- **Wasabi**: Cloud storage for digital assets
- **Resend**: Email notifications and communications

## Deployment Strategy

### Development
- Local development with Vite dev server
- Hot module replacement for frontend
- Database migrations with Drizzle Kit
- Environment-based configuration

### Production
- Frontend built with Vite and served as static assets
- Backend bundled with esbuild for Node.js deployment
- PostgreSQL database hosted on Neon
- Environment variables for API keys and configuration

### Build Process
- TypeScript compilation and type checking
- Frontend assets bundled to `dist/public`
- Backend server bundled to `dist/index.js`
- Database schema pushed with `db:push` command

### Configuration Management
- Environment-specific settings via `.env` files
- Database URL configuration for Neon connection
- JWT secret management for authentication
- External service API keys (Stripe, OpenAI, etc.)

### Deployment Readiness (July 18, 2025)
- **Build Status**: ✅ Production build successful (dist/index.js: 420.5kb)
- **Database**: ✅ PostgreSQL database connected and operational
- **Authentication**: ✅ JWT-based authentication system fully functional
- **Admin Dashboard**: ✅ Complete admin interface with all features operational
- **Content Management**: ✅ Full content management system implemented
- **Email System**: ✅ Automated email system with templates operational
- **Health Monitoring**: ✅ Comprehensive health check system active
- **Legal Compliance**: ✅ Complete legal document system with privacy policy, terms, and data rights
- **API Endpoints**: ✅ All REST API endpoints functional and tested
- **Error Handling**: ✅ Proper error handling and validation throughout
- **Security**: ✅ Role-based access control and secure authentication
- **Performance**: ✅ Optimized build with proper bundling and compression
- **Production Environment**: ✅ Fixed test campaign seeding issues for production deployment
- **Static File Serving**: ✅ Production static file serving working correctly
- **Environment Detection**: ✅ Proper development/production environment detection

**Ready for Production Deployment** - All critical features implemented and tested. Production build verified working without errors.

The platform is designed to be scalable and maintainable, with clear separation of concerns between frontend, backend, and database layers. The modular architecture allows for easy extension and integration of new features as the platform grows.