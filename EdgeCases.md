Edge cases by category
Auth edges

Cookie missing or expired → middleware redirects to /login. Next.js must not flash the protected page before redirect fires.
Token tampered → Go returns 401. Next.js catches it and redirects, not crashes.
User signs up but closes the tab before redirect → partial account exists. Login should still work.
Concurrent sessions (phone + laptop) → JWT is stateless so both work. If you ever want to force-logout all devices, you'll need a token blocklist in MongoDB.

Autosave edges

User types, then immediately hits Submit before the 2s debounce fires → you could have two races: PATCH (draft) and POST (submit) hitting Go at the same time. Fix: cancel the debounce timer on Submit click before firing submit.
First keystroke on a brand new entry → Next.js has no _id yet. First autosave must be a POST (create), not a PATCH. Store the returned _id in state, all subsequent saves become PATCH.
Network drops mid-autosave → show a persistent "unsaved" warning, don't silently lose work.

Submit flow edges

Python processor is down → Go returns 503. Next.js must exit the processing animation and show an error state, not hang forever.
LLM returns malformed JSON (it sometimes does even with instructions) → Python's JSON strip/parse already handles this defensively. Go should still return a 500 if parsing fails completely so Next.js knows.
User hits Submit twice → disable the Submit button immediately on first click and re-enable only on error.
Very long entry (1000+ words) → Groq has a token limit. You need a character limit on the editor (warn at ~2000 chars, hard block at ~4000).

Data security edges

GET /journal must always include { user_id: userId } in the MongoDB filter. A missing filter returns all users' data — the most dangerous bug possible.
GET /journal/:id must check that the fetched document's user_id matches the authenticated userId. Otherwise user A can read user B's entry by guessing ObjectIds.
Profile stats aggregation ($group, $avg) must all be scoped to { user_id: userId }.

Session edges

JWT expiry while the user is mid-write → the next API call returns 401. Next.js should catch 401 responses globally, save the draft to localStorage as a last resort, then redirect to /login with a ?reason=session_expired query param. After re-login, restore the draft.