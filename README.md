## ⚠ Problems Faced & How I Solved Them

1️⃣ Bookmarks Were Visible to All Users (Privacy Issue)

**Problem:**  
Initially, Row Level Security (RLS) was disabled in Supabase, which meant any authenticated user could potentially access all bookmarks.

**Solution:**  
- Enabled RLS on the `bookmarks` table.
- Created SELECT, INSERT, and DELETE policies using:

```sql
auth.uid() = user_id

```


2️⃣ Delete Operation Was Not Updating in Real-Time

Problem:
When deleting a bookmark in one tab, it was not reflecting in another tab automatically.

Solution:

Enabled Realtime in Supabase.

Set replica identity:

```sql
ALTER TABLE public.bookmarks REPLICA IDENTITY FULL;

```

Subscribed to postgres_changes in the frontend.

Now all changes (insert/delete) update instantly without page refresh.



3️⃣ Google OAuth Always Logged Into Same Account

Problem:
Google OAuth automatically logged into the previously used account without asking to select another account.

Solution:

Added multiple test users in Google Cloud Console.

Tested using separate browser sessions to verify multi-user behavior.