# Design Decisions

## Scope and assumptions

Threadline is designed for a small service desk. A staff member signs in, records a customer inquiry, finds it through search or status filters, and moves it through its lifecycle. Registration, external messaging, roles, and a shared queue were intentionally left out because they are outside the minimum workflow.

## Ownership and access

Each inquiry belongs to the staff member who created it. Staff can view and update only their own inquiries. This is a deliberately simple access rule that is easy to explain and appropriate for the assessment's two seeded accounts.

Authorization is enforced by the API, not just the React interface. The list, detail, and status-update queries all include the authenticated user's `owner_id`. A user who guesses another inquiry's ID receives a not-found response, so a direct URL cannot bypass the access rule.

## Validation and duplicate submissions

Validation happens at both boundaries. The frontend uses required fields and minimum lengths to guide the user quickly. The API independently validates the payload with Zod, so requests made outside the UI are still rejected.

Duplicate submissions are stored as separate inquiries. There is no reliable business key for deciding whether two customer messages are duplicates, and automatic merging could lose information. Staff can distinguish records using the customer, subject, contact details, and timestamps.

## Status lifecycle

An inquiry can be `New`, `In progress`, or `Resolved`. Any of these states can be selected, including reopening a resolved inquiry. Customers may return with a follow-up request, so a separate reopen workflow would add complexity without improving this small system. Each status change is validated by the API and immediately updates `updated_at`.

## Stale data trade-off

The application does not use realtime updates. If two tabs show the same inquiry, one tab can become stale after the other changes its status. The latest successful update wins, and the older tab sees the new state after a refresh or filter change.

This trade-off keeps the implementation appropriate for the requested scope and avoids adding websockets or complex conflict resolution. A production version could add an `updated_at` or version precondition and return `409 Conflict` when a user tries to save an outdated record.

## Failure behavior and testing

The API returns predictable responses: `401` for missing or invalid authentication, `400` for invalid IDs or payloads, and `404` for missing or inaccessible inquiries. The UI provides loading, empty, success, network-error, and validation-error states.

The backend tests cover independent inquiry validation, and the frontend test covers failed-login feedback. The main remaining gap is a live PostgreSQL integration test covering ownership and status updates. That would be the first addition to a CI pipeline.

## Next improvements

I would add an activity history so staff can see who changed a status and when. After the business clarifies whether inquiries should be personal or team-owned, I would consider shared queues and roles. I would also add the PostgreSQL integration tests before introducing more features.

## AI transparency

AI assisted with the initial project structure, API/UI boilerplate, and test scaffolding. I accepted the small REST design and owner-scoped SQL approach after reviewing how they map to the requirements. I changed the generated seed password hash after verifying it against the documented demo password, and rejected unrelated dashboard features to keep the submission focused and explainable.
