# Admin Moderation & Platform Operations Architecture

## Operational Philosophy

The admin system is designed as an operations layer, not a CRUD panel. Moderators work through queues, action states, protected controls, audit trails, and platform health indicators so decisions can be reviewed later and scaled across larger teams.

## RBAC Strategy

Roles use a hierarchy: `user`, `guide`, `moderator`, `admin`, `super_admin`. The RBAC middleware exposes permission checks such as `reports:read`, `content:moderate`, `users:moderate`, `users:roles`, `analytics:read`, and `audit:read`. Legacy roles (`explorer`, `pathfinder`, `sentinel`, `architect`) remain recognized during authorization to avoid locking out existing development accounts.

## Audit Logging

Every privileged moderation or admin action writes an `AuditLog` record with actor, action, target, target type, metadata, severity, and timestamp. This gives the platform traceability for report assignment, resolution, content hiding, suspensions, role changes, reputation adjustments, and bulk actions.

## Reporting Pipeline

Reports support multiple content targets: posts, replies, reviews, users, mentor profiles, and roadmaps. Report state moves through `pending`, `assigned`, `reviewed`, `actioned`, or `dismissed`, with assigned moderators, priority, resolution notes, and moderator notes. This shape allows future routing, SLAs, queue ownership, and abuse scoring without changing the core workflow.

## Analytics Aggregation

Admin analytics use MongoDB aggregation pipelines for growth, top mentors, roadmap completions, engagement categories, review volume, abuse spikes, and retention snapshots. These are intentionally service-layer aggregations so they can later be mirrored into a warehouse, scheduled materialized collections, or external BI tooling.

## Observability

Request context middleware adds correlation IDs, request timing, structured request completion logs, user ID metadata, and error response request IDs. The logger output is compatible with future Sentry, Datadog, OpenTelemetry, Grafana, and centralized log ingestion.

## Future Moderation Intelligence

The moderation service keeps actions target-based and metadata-rich. That leaves room for AI moderation, toxicity detection, spam scoring, fraud signals, automated triage, and moderator assist tooling without hardcoding one fixed moderation flow.
