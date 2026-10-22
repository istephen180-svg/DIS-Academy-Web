# DIS Academy 2.3.2 — Save Confirmation and Snapshot Persistence Fix

## Investigation findings
The 2.3.1 frontend first committed classes and students to dedicated record tables through `/api/records/sync`, then wrote general application state through `/api/state`. The latter combined the authoritative `school_snapshots` write and secondary relational-table synchronisation in one PostgreSQL transaction. If secondary synchronisation failed, the transaction rolled back the application snapshot and returned a failure even though the dedicated class/student record was already committed. That explains the mismatch between the warning and the record appearing after the next login.

## Correction
- Commit the authoritative non-student application snapshot in its own verified transaction.
- Run secondary relational synchronisation in a separate transaction, while serialising saves per school.
- A secondary-sync failure is logged with the underlying database error and no longer rolls back the already-committed application snapshot or causes the UI to tell administrators to retry a record that is already saved.
- The frontend immediately completes the save flow and refreshes the class/student screen when the authoritative save is successful. It logs a warning if the secondary mirror step failed; the API deployment logs include the underlying failure for further diagnosis.
- API request failures now log available server-side detail in the browser console to improve future diagnosis without replacing the user-facing error with raw SQL detail.
- Student ID allocation, duplicate detection, dedicated student/class tables, and other application modules are otherwise unchanged.

## Important verification note
This fix was inspected and tested for JavaScript syntax and archive integrity in the build environment. The live Render/Supabase deployment cannot be exercised from this environment, so after deployment verify: (1) create a class and confirm it appears immediately; (2) enrol a student and confirm the record appears immediately; (3) refresh/reopen the app and confirm both remain; (4) check Render API logs for `relational_sync_failed_after_snapshot_commit`. If that line appears, the student/application save is committed, but the exact secondary relational SQL issue still needs separate follow-up.

## Deployment
Replace the existing API deployment ZIP and its `package.json` with the 2.3.2 versions. Replace the existing frontend files with the 2.3.2 web ZIP. Preserve Render environment variables and existing database records. No destructive SQL migration is required.
