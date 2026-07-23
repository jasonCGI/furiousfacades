# Josh Social Publisher: Web Application Plan

## 1. Purpose

Build a private, responsive web application that lets Josh prepare, preview, schedule, and publish content to his Facebook and Instagram business presences from one interface.

### Scope update: multi-platform delivery and deterministic review

The composer and review model should also support TikTok, Threads, X, and LinkedIn. The interface should generate a distinct image derivative and a human review tab for every selected destination before any publish job is created. Publishing integrations can be delivered in phases, but the draft, crop preview, spellcheck, grammar confirmation, and review workflow should be platform-neutral from the start.

Use `SOCIAL-PUBLISHER-CONTENT-RULES.md` as the version-controlled, non-agentic source for writing, proofread, accessibility, image, and human-review rules. The app should enforce mechanical checks locally and leave editorial judgment with Josh.

The first release should optimize for one trusted operator and accounts Josh owns or manages. It should not begin as a public social-media management service.

This plan is stored in the Furious Facades repository for collaboration. The application itself should eventually live in its own repository and Railway service so its authentication, secrets, database, and deployment lifecycle remain isolated from the public marketing website.

## 2. Platform reality and supported accounts

The application must explain these limits during onboarding instead of promising unsupported personal-account publishing.

### Facebook

- The official Meta API supports publishing to Facebook Pages that the authenticated user manages.
- It does not support general automated publishing to a person's normal Facebook profile.
- Josh can use a personal Facebook identity to authorize access to Pages he manages, but the publishing destination is the Page.

### Instagram

- API publishing requires an Instagram Professional account, either Business or Creator.
- Consumer or private Instagram accounts are not supported for automated publishing.
- The Meta account connection and required permissions depend on the current Instagram API login flow selected during implementation.
- The application should verify account eligibility before presenting Instagram as an available destination.

### Initial product wording

Use language such as:

> Connect the Facebook Pages and Instagram Professional accounts you manage.

Do not advertise automatic publishing to personal Facebook profiles or consumer Instagram accounts.

## 3. Product principles

1. One draft can feed multiple destinations, but each destination can have its own caption and media settings.
2. Nothing publishes without a clear final review.
3. Facebook and Instagram publishing are separate jobs with separate results.
4. Partial success is visible and recoverable.
5. Passwords are never collected or stored.
6. OAuth tokens remain on the server and are encrypted at rest.
7. Accessibility and mobile use are first-class requirements.
8. The interface reports facts. It never claims a post succeeded until the platform confirms it.

## 4. MVP scope

### Included

- Private sign-in for Josh
- Connect and disconnect Meta accounts through OAuth
- Discover eligible Facebook Pages and Instagram Professional accounts
- Select one or more connected destinations
- Create a shared master caption
- Override the caption per platform
- Upload one image
- Add image alternative text
- Preview Facebook and Instagram variants
- Publish immediately
- Schedule publication for a future date and time
- Save drafts
- View publishing history
- Show per-destination status and platform response
- Retry only failed destinations
- Open successful posts on their platforms
- Revoke a connection and delete stored tokens

### Deferred until after MVP

- Personal Facebook profile publishing
- Consumer Instagram accounts
- Carousels
- Stories
- Reels and video transcoding
- First-comment hashtags
- Cross-platform analytics
- Comment and inbox management
- AI-generated captions or images
- Team approval workflows
- Multiple unrelated customer organizations
- X, LinkedIn, TikTok, Pinterest, or Threads

The first media format should be a single image because it creates the smallest reliable publishing surface. Carousels and video should be separate later phases with their own validation and processing.

## 5. Primary user journeys

### A. First-time connection

1. Josh signs into the application.
2. The dashboard explains supported account types.
3. Josh selects `Connect Meta`.
4. The browser opens Meta's OAuth authorization flow.
5. Josh grants only the required permissions.
6. The server exchanges the authorization code securely.
7. The application discovers eligible Facebook Pages and Instagram Professional accounts.
8. Josh selects which destinations to enable.
9. The dashboard confirms the connection and shows token health without exposing the token.

### B. Create and publish now

1. Josh selects `New post`.
2. He chooses Facebook, Instagram, or both.
3. He uploads an image and supplies alternative text.
4. He writes the master caption.
5. He optionally customizes each platform caption.
6. The application validates the media and content for each destination.
7. Josh reviews the platform previews.
8. He selects `Publish now`.
9. A confirmation dialog lists the exact destinations.
10. The server creates one publish job per destination.
11. The result view updates each job independently.
12. Successful jobs show a platform link. Failed jobs show a useful error and a retry action.

### C. Schedule a post

1. Josh follows the normal compose flow.
2. He chooses `Schedule` and selects a local date and time.
3. The interface shows the timezone explicitly.
4. The server stores the scheduled time in UTC.
5. A background worker claims the due jobs.
6. Josh can edit or cancel the schedule until processing begins.
7. The history view records the final result for each destination.

### D. Recover from partial failure

Example: Facebook succeeds and Instagram fails.

1. The application displays Facebook as published with its permalink.
2. Instagram displays as failed with a human-readable explanation.
3. The main action becomes `Retry Instagram` rather than `Publish all`.
4. A retry creates another Instagram attempt without duplicating Facebook content.

## 6. HTML front-end plan

The front end should use semantic HTML, modern CSS, and small vanilla JavaScript modules for the first version. A framework is not required for this single-user workflow.

### Shared page structure

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header>...</header>
  <nav aria-label="Primary">...</nav>
  <main id="main-content">...</main>
  <div id="announcer" class="visually-hidden" aria-live="polite"></div>
</body>
```

Use server-rendered pages or progressively enhanced HTML where practical. Core actions should not depend on a large client-side application shell.

### Main screens

#### 1. Sign-in

- Product name and purpose
- One secure sign-in method
- Privacy note explaining that social passwords are never collected
- Clear support contact

#### 2. Dashboard

- `New post` primary action
- Connected-account summary
- Draft count
- Upcoming scheduled posts
- Recent results
- Connection warnings and expired-token notices

#### 3. Connections

- Meta connection card
- Connected Facebook Pages
- Connected Instagram Professional accounts
- Account avatar, name, platform, and status
- Last successful token check
- Reconnect and disconnect actions
- Explanation of unsupported account types

#### 4. Composer

- Destination checkboxes grouped by platform
- Master caption field
- Character counter and platform validation
- Image upload with thumbnail
- Image crop guidance
- Alternative-text field
- Platform override tabs or accordions
- Facebook preview
- Instagram preview
- Save draft, schedule, and publish controls

On mobile, the composer should use a single column. Destination controls and validation should appear before the final action, not in a hidden sidebar.

#### 5. Final review

- Exact destination list
- Final image
- Final caption for each destination
- Publish timing and timezone
- Warnings that do not block publishing
- Errors that must be corrected
- Explicit `Publish to 2 destinations` or `Schedule 2 posts` action

#### 6. Schedule

- Calendar-style list or simple chronological agenda
- Status filters
- Edit and cancel actions
- Timezone displayed near every scheduled time
- Conflict warning if the same content is scheduled twice

#### 7. History and result detail

- One parent post row with child destination results
- Draft, scheduled, processing, published, partial, failed, or canceled status
- Published permalink
- Attempt timestamps
- Sanitized error explanation
- Retry failed destination action

### Reusable interface components

- Account badge
- Destination selector
- Status badge with icon and text
- Media uploader
- Validation summary
- Caption editor
- Platform preview card
- Confirmation dialog
- Toast or inline notification
- Empty state
- Loading state
- Recoverable error panel

### Accessibility requirements

- Meet WCAG 2.2 AA for the application workflow.
- All functionality must work with a keyboard.
- Use visible focus states.
- Use actual buttons for actions and links for navigation.
- Associate every form control with a visible label.
- Announce asynchronous publishing-status changes through an ARIA live region.
- Do not rely on color alone for status.
- Move focus to the validation summary after a failed submission.
- Preserve entered content after validation or network failures.
- Dialogs must trap focus while open and return focus when closed.
- Respect `prefers-reduced-motion`.
- Ensure touch targets are at least 44 by 44 CSS pixels where practical.

## 7. Proposed visual direction

This is an operational tool, not a copy of the public Furious Facades website.

- Dark neutral interface with restrained Furious Facades accents
- Bone-white text, blood-red warning accents, and clear green success states
- High-contrast forms and status indicators
- Product photography used in previews, not as form backgrounds
- Dense enough for desktop work while remaining comfortable on a phone
- Minimal decorative animation

The visual identity can reference Furious Facades, but clarity and trust should take priority over horror effects in authorization, scheduling, and publishing states.

## 8. System architecture

```text
Browser
  |
  | HTTPS
  v
Node web application
  |-- HTML pages and JSON endpoints
  |-- session and CSRF protection
  |-- Meta OAuth callback
  |-- publishing coordinator
  |
  +-- PostgreSQL
  |     users, connections, destinations, drafts, jobs, attempts
  |
  +-- Private object storage
  |     original and prepared media
  |
  +-- Background worker
        scheduled and immediate publish jobs
          |-- Facebook Graph API
          +-- Instagram API
```

### Recommended deployment

- Separate GitHub repository
- Separate Railway web service
- Railway PostgreSQL
- Separate Railway worker service or a worker process in the same project
- S3-compatible object storage with signed URLs
- HTTPS only
- Production, staging, and local environment separation

Do not place OAuth secrets, token-encryption keys, or database credentials in the HTML, Git repository, browser storage, logs, or public Furious Facades service.

## 9. Backend responsibilities

Although the interface is HTML-based, direct browser-to-platform publishing is not acceptable. A trusted server is required to protect credentials and coordinate reliable jobs.

The backend must:

- Handle application authentication and sessions
- Start and validate OAuth flows
- Store encrypted tokens
- Refresh or reconnect tokens when required
- Discover managed destinations
- Validate content before queueing
- Create immutable publish attempts
- Prepare platform-specific media
- Provide temporary public media URLs when a platform requires them
- Publish through official APIs
- Normalize platform responses
- Retry transient failures safely
- Record platform identifiers and permalinks
- Delete expired temporary media
- Produce an audit log

## 10. Suggested HTTP routes

### HTML routes

- `GET /login`
- `GET /dashboard`
- `GET /connections`
- `GET /posts/new`
- `GET /posts/:postId/edit`
- `GET /posts/:postId/review`
- `GET /schedule`
- `GET /history`
- `GET /history/:postId`

### Authentication and connection routes

- `POST /session`
- `POST /logout`
- `GET /connect/meta`
- `GET /connect/meta/callback`
- `POST /connections/:connectionId/refresh`
- `POST /connections/:connectionId/disconnect`

### Draft and publishing routes

- `POST /posts`
- `PATCH /posts/:postId`
- `POST /posts/:postId/media`
- `DELETE /posts/:postId/media/:mediaId`
- `POST /posts/:postId/validate`
- `POST /posts/:postId/publish`
- `POST /posts/:postId/schedule`
- `POST /posts/:postId/cancel`
- `POST /jobs/:jobId/retry`
- `GET /jobs/:jobId/status`

Every state-changing route must require authentication and CSRF protection.

## 11. Data model

### `users`

- `id`
- `email`
- `display_name`
- `role`
- `created_at`
- `last_login_at`

### `social_connections`

- `id`
- `user_id`
- `provider`
- `provider_user_id`
- `encrypted_access_token`
- `encrypted_refresh_token`, when supplied
- `token_expires_at`
- `scopes`
- `status`
- `last_verified_at`
- `created_at`
- `revoked_at`

### `destinations`

- `id`
- `connection_id`
- `platform`
- `provider_destination_id`
- `display_name`
- `username`
- `account_type`
- `avatar_url`
- `can_publish`
- `capabilities_json`
- `status`

### `posts`

- `id`
- `author_user_id`
- `master_caption`
- `alt_text`
- `status`
- `scheduled_for_utc`
- `timezone_at_creation`
- `created_at`
- `updated_at`

### `post_variants`

- `id`
- `post_id`
- `destination_id`
- `caption_override`
- `settings_json`
- `validation_json`

### `media_assets`

- `id`
- `post_id`
- `storage_key`
- `mime_type`
- `byte_size`
- `width`
- `height`
- `checksum`
- `processing_status`
- `created_at`
- `delete_after`

### `publish_jobs`

- `id`
- `post_id`
- `post_variant_id`
- `status`
- `scheduled_for_utc`
- `locked_at`
- `attempt_count`
- `next_attempt_at`
- `provider_post_id`
- `provider_permalink`
- `published_at`
- `last_error_code`
- `last_error_summary`

### `publish_attempts`

- `id`
- `publish_job_id`
- `attempt_number`
- `started_at`
- `finished_at`
- `result`
- `provider_request_id`
- `sanitized_response_json`

Never store raw secrets or full provider responses containing tokens.

## 12. Publishing state model

```text
draft
  -> ready
  -> scheduled
  -> queued
  -> processing
      -> published
      -> retry_wait
      -> failed
  -> canceled
```

The parent post status is derived from its destination jobs:

- All published: `published`
- Mix of published and failed: `partial`
- All failed: `failed`
- Any still pending: `processing` or `scheduled`

Publishing must be idempotent. Repeated browser submissions, worker restarts, or network timeouts must not silently duplicate posts. Each job should use a stable internal idempotency key and check for an existing provider result before another attempt.

## 13. Media workflow

1. Browser validates basic file type and size for quick feedback.
2. Server independently validates the uploaded bytes.
3. Server records dimensions, MIME type, size, and checksum.
4. Server strips unnecessary metadata where appropriate.
5. Server prepares destination-specific derivatives without overwriting the original.
6. Worker creates a short-lived public or signed URL if the Meta endpoint requires an externally reachable asset.
7. Worker publishes the asset and caption.
8. Temporary public access expires after publishing.
9. Retention policy deletes unused drafts and temporary derivatives after an agreed period.

Do not accept SVG, executable files, or content based only on a filename extension.

## 14. Security and privacy

### Required controls

- OAuth authorization-code flow with validated `state`
- PKCE when supported by the selected Meta flow
- Least-privilege Meta permissions
- Server-side sessions using `Secure`, `HttpOnly`, and appropriate `SameSite` cookies
- CSRF tokens on state-changing requests
- Strong Content Security Policy
- Rate limiting on sign-in, OAuth, upload, publish, and retry routes
- AES-256-GCM or a managed secrets system for token encryption at rest
- Encryption key stored only in deployment secrets
- Token values redacted from application logs and error monitoring
- File signature and MIME validation
- Image decompression limits
- Signed object-storage URLs with short expiration
- Database backups and documented restoration test
- Explicit disconnect and account-data deletion controls
- Audit records for connection, scheduling, publishing, retry, and deletion actions

### Logging rules

Log:

- Internal user and job IDs
- Platform name
- Destination ID in a safe form
- Provider request ID
- Status transitions
- Sanitized error codes

Never log:

- Access tokens
- Refresh tokens
- OAuth authorization codes
- Cookie values
- Full request headers
- Uploaded file contents
- Private provider responses unrelated to debugging

## 15. Error handling and retries

Classify failures before retrying.

### Retry automatically

- Network timeout
- Connection reset
- Platform `429` response after the prescribed delay
- Platform `5xx` response
- Temporary media-processing state

Use exponential backoff with jitter and a maximum attempt count.

### Require user action

- Permission revoked
- Token expired without a refresh path
- Account no longer eligible
- Image dimensions or format rejected
- Caption rejected
- Destination removed
- Platform policy restriction

Do not retry permanent validation or authorization failures automatically.

## 16. Meta application setup

Implementation should use Meta's current official documentation and pin a Graph API version after validating it in a test environment.

Initial setup will require:

1. A Meta developer account owned by the appropriate business owner.
2. A Meta app configured for the chosen Facebook and Instagram login flows.
3. A privacy-policy URL.
4. A data-deletion instructions URL or callback as required.
5. Valid OAuth redirect URLs for local, staging, and production environments.
6. Josh's Facebook identity and managed assets added for development testing.
7. Only the permissions required for Page discovery and content publishing.
8. App Review and business verification if the app later serves accounts outside the app's owned or assigned roles.

Before implementation, confirm the current permission names and account-linking requirements. Meta evolves these APIs, and permission names must not be copied blindly from an old tutorial.

## 17. Testing strategy

### Unit tests

- Caption and media validation
- State transitions
- Retry classification
- Timezone conversion
- Token encryption and decryption
- Permission and capability mapping
- Parent status derivation

### Integration tests

- OAuth callback validation
- Destination discovery
- Object-storage upload and signed URL generation
- Database transaction around job creation
- Worker claim and lock behavior
- Mocked Facebook and Instagram success, rate-limit, auth, and validation responses

### End-to-end tests

- Sign in and connect test assets
- Save and reopen a draft
- Publish to Facebook only
- Publish to Instagram only
- Publish to both
- Partial failure and targeted retry
- Schedule, edit, and cancel
- Disconnect account
- Keyboard-only composer and confirmation flow
- Mobile composer at 320 and 390 CSS pixels

### Production smoke test

Use dedicated test destinations before publishing to real customer-facing accounts. Verify the platform permalink and visible content, not only the API response.

## 18. Delivery phases

### Phase 0: Account and API feasibility

- Inventory Josh's Facebook Pages and Instagram account types.
- Confirm Page roles and ownership.
- Confirm Instagram Professional status.
- Create Meta development assets and test accounts.
- Validate one manual API publication to each platform.
- Record current permission and review requirements.

Exit condition: a controlled test image can be published through the official API to one Facebook Page and one Instagram Professional account.

### Phase 1: UX prototype

- Create semantic HTML screens with realistic states.
- Test desktop and mobile composition.
- Validate destination selection, caption overrides, previews, final review, and error recovery.
- Run keyboard and screen-reader checks.

Exit condition: Josh can complete the workflow in a browser prototype without live publishing.

### Phase 2: Secure foundation

- Create the separate application repository.
- Add authentication, sessions, CSRF, database, migrations, and encrypted secrets.
- Implement Meta OAuth and destination discovery.
- Add connection health and disconnect flow.

Exit condition: Josh can securely connect and view eligible destinations after signing in.

### Phase 3: Drafts and immediate publishing

- Add image upload and validation.
- Add drafts and platform variants.
- Add final review.
- Implement immediate Facebook and Instagram jobs.
- Add per-destination result reporting and safe retry.

Exit condition: one image post can publish reliably to either or both platforms without duplicate posts.

### Phase 4: Scheduling and operations

- Add scheduling and UTC conversion.
- Add worker locking, retries, and monitoring.
- Add history, audit trail, and cancellation.
- Add retention cleanup.
- Add alerts for repeated failures and expiring connections.

Exit condition: scheduled posts survive process restarts and produce a clear final result.

### Phase 5: Production hardening

- Complete threat modeling.
- Run accessibility review.
- Test database restoration.
- Review Meta permissions and production configuration.
- Add privacy policy and data-deletion workflow.
- Document support and incident response.

Exit condition: the private application can be used for normal Furious Facades publishing with an understood recovery path.

### Phase 6: Optional expansion

Evaluate separately:

- Carousels
- Reels
- Stories
- Reusable templates
- Hashtag groups
- Approval workflow
- Analytics
- X integration
- Multiple organizations

Each expansion should begin with a new API and policy feasibility check.

## 19. MVP acceptance criteria

The MVP is ready when all of the following are true:

1. Josh can sign in without sharing a social password with the application.
2. He can connect at least one eligible Facebook Page and one Instagram Professional account.
3. Tokens are encrypted and never returned to browser JavaScript.
4. He can upload and preview one supported image.
5. He can use a shared caption or platform-specific captions.
6. Invalid content is identified before publishing.
7. He sees the exact destinations in a final confirmation.
8. Facebook and Instagram run as separate, idempotent jobs.
9. A partial failure does not duplicate the successful platform during retry.
10. Scheduled times are stored in UTC and displayed in Josh's selected timezone.
11. History shows accurate status, attempts, timestamps, and platform links.
12. The primary workflow works at 320 CSS pixels and with keyboard-only navigation.
13. Account disconnection revokes or deletes stored authorization where supported.
14. Logs contain no tokens, authorization codes, session cookies, or uploaded media.
15. Production smoke tests confirm posts visibly appear on the intended test destinations.

## 20. Decisions needed before coding

1. Which Facebook Page or Pages should be available?
2. Is Josh's Instagram account currently Business, Creator, or consumer?
3. Is the Instagram account linked to the intended Facebook Page, if the selected API flow requires it?
4. Should the first release support Josh only, or Josh plus one collaborator?
5. Is `Publish now` required in the first usable release, or can the first live version begin with drafts only?
6. Is scheduling required for MVP or acceptable immediately after direct publishing?
7. What is the maximum expected image size?
8. How long should drafts and original media be retained?
9. Should the interface use Furious Facades branding or a neutral product identity that could later support other ventures?
10. Who should own the Meta developer app and production credentials?

## 21. Official references

Verify these again at implementation time because platform requirements can change.

- Meta Instagram API official collection: <https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api>
- Meta Instagram content publishing documentation: <https://developers.facebook.com/docs/instagram-platform/content-publishing/>
- Meta Pages API documentation: <https://developers.facebook.com/docs/pages-api/>
- Meta access-token documentation: <https://developers.facebook.com/docs/facebook-login/guides/access-tokens/>
- Meta App Review documentation: <https://developers.facebook.com/docs/app-review/>

## 22. Recommended first action

Before designing production code, complete Phase 0. Confirm the exact Facebook Page ownership, Instagram account type, selected Meta login flow, and current permissions. A one-image API proof of concept will retire the largest project risk before time is spent building the full composer and scheduler.
