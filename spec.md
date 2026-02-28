# Specification

## Summary
**Goal:** Fix the "Download Database" button on the Members page so it is visible and functional.

**Planned changes:**
- Ensure the "Download Database" button is rendered in the Members page header area, alongside the page title, without requiring any scrolling or extra interaction to reveal it.
- Style the button consistently with the app's existing design theme (colors, typography, spacing).
- Ensure the button triggers a client-side CSV download of all currently loaded member records with columns: Membership Number, Name, Mobile No, Alternate Mobile, Address, Area, Spouse Name, Family Member Count.
- Ensure the button remains visible and functional regardless of whether the members list is empty, loading, or populated.

**User-visible outcome:** Users can see and click the "Download Database" button on the Members page to download a CSV file of all member records at any time.
