# Specification

## Summary
**Goal:** Fix the "Unauthorized: Only users can bulk add members" error in the backend `bulkAddMembers` function so authenticated Internet Identity users can successfully perform bulk uploads.

**Planned changes:**
- Inspect the access control check in the Motoko actor's `bulkAddMembers` function
- Update the principal/identity validation logic in `bulkAddMembers` to match the same check used in the `addMember` function, allowing authenticated (non-anonymous) callers while still rejecting anonymous principals

**User-visible outcome:** Authenticated users can bulk upload members via the BulkUploadPage without encountering an "Unauthorized" error, and the import completes successfully.
