# Decisions

## Scope and assumptions

Threadline models a small service desk where each staff member owns the inquiries they record. The brief did not require shared queues or roles, so the simpler ownership rule keeps access predictable and demonstrates authorization clearly. Two seeded staff accounts make the rule easy to demonstrate.

## Meaningful choices

**Ownership is server-enforced.** Every inquiry list, detail, and status update includes the authenticated user's `owner_id` in its SQL predicate. A user who guesses another inquiry's ID receives the same not-found style response as any inaccessible record. This prevents a direct-link bypass.

**Validation exists at both boundaries.** The form provides native required/minimum-length guidance for fast feedback, while the API uses Zod and rejects the request independently. Duplicate submissions are accepted as separate records because the business has no reliable inquiry key; staff can distinguish them by contact, subject, and timestamps without a risky deduplication guess.

**Status changes are deliberately simple.** New, In progress, and Resolved are all selectable, including reopening a resolved inquiry. Real customer conversations can resume, and requiring a separate reopen workflow would add complexity without improving this assessment's core workflow. Every change updates `updated_at` and is saved immediately.

## Stale data trade-off

The list is refreshed when the selected status filter changes and after a local mutation, but there is no realtime synchronization. If two tabs show the same inquiry, the later save wins and the older tab may display stale data until refreshed. This is an intentional ten-hour-scale trade-off: the UI makes successful saves visible, while avoiding websockets or optimistic concurrency that the brief does not need. A next iteration could add an `updated_at`/version precondition and return `409 Conflict` for stale writes.

## Failure behavior

Unauthenticated API requests return `401`; invalid IDs return `400`; missing or inaccessible records return `404`; invalid input returns `400` with a general message and field information. The UI shows loading, empty, success, and error states rather than silently failing.

## What I would improve next

I would add an integration test against PostgreSQL for ownership and status updates, then add a small activity history table so staff can see who changed a status and when. A shared queue/role model would be the next product decision once the business clarifies whether inquiries are personal or team-owned.

## AI transparency

AI helped draft the initial project structure, API/UI boilerplate, and test scaffolding. I accepted the small REST shape and the owner-scoped SQL queries, but evaluated and changed the generated seed password hash after verifying it against the documented demo password. I also kept the feature set intentionally narrow rather than adding unrelated dashboard features.
