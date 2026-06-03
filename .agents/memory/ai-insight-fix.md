---
name: AI insight projection fix
description: Why the daily-rate projection was showing huge numbers and how it was fixed
---

**Bug:** `dailyRate = totalSpent / daysPassed` used ALL unpaid expenses regardless of when they were created. If a user adds 10 future-planned expenses on day 1, `totalSpent` is large but `daysPassed=1`, projecting an enormous monthly spend.

**Fix (in AppContext.tsx):**
1. Filter expenses to only those created this month before computing daily rate.
2. Only show projection if `daysPassed >= 5` (insufficient data otherwise).
3. Fall back to showing current percentage of income spent for early-month state.

**Why:** The projection formula assumes expenses accumulate over time. When all expenses are added at once, the rate is meaningless. The fix uses real daily accumulation data.
