---
name: ScoreRing semantics
description: What the ring shows and how it's colored
---

The `ScoreRing` component was changed from showing an abstract 0–100 financial health score to showing `spentPercent` (spending as % of monthly income).

**Color scheme (inverted from score):**
- Green `#00E676`: < 50% spent → "ممتاز"
- Yellow `#FFB700`: 50–75% → "جيد"
- Orange `#FF9800`: 75–90% → "تنبّه"
- Red `#FF4B4B`: ≥ 90% → "خطر"

**Props:** Changed from `score: number` to `spentPercent: number`.

**Why:** The user found the abstract score confusing. Spending percentage is immediately understandable and directly useful.
