# MedStreak

**📱 New to this? See [INSTALL-ANDROID.md](INSTALL-ANDROID.md) for 2-minute step-by-step install instructions.**

Medication reminders + streaks + a signed-in public chat. Expo / React Native (iOS + Android). **Runs entirely on Firebase's free Spark plan** — no billing, no Cloud Functions, no deploy command.

## Features
- Daily reminders with Taken / Snooze actions, daily "Did you take your meds today?" popup with confetti
- Streaks (with a streak shield every 7 days, max 2), milestones/badges, adherence calendar
- Refill reminders, goals (streak, adherence %, custom)
- Streak freezes (earn one every 7 days, max 2; use "Freeze today" for sick days or travel)
- 24 themes, plus 5 unlockable animated themes (petals, aurora, falling stars, lava lamp, rainbow wave) earned with streak milestones
- Update notifier (checks GitHub Releases, one-tap download) and on-device crash reports you choose to share
- Live public chat (sign-in required) with Report → warning → ban, custom bubble colors
- Six color themes

## Run it
```
npm install --legacy-peer-deps
cp .env.example .env   # fill in Firebase values
npx expo start         # Expo Go works for everything except Google/Apple sign-in
```
Google/Apple sign-in need a development build.

## Moderation design (rules only, free tier)
- **One account per email:** `emailOwners/{email}` records the first uid that registered a verified email. Every later uid for that email inherits that uid as its identity **key** (`members/{uid}.firstUid`). Deleting and re-registering keeps the same key.
- **Report:** one atomic batch writes `strikes/{key}_1`, sets `status/{key}.level = 1` and hides the message. Warning shown to the offender once.
- **Second report** must come from a *different* reporter and writes `strikes/{key}_2`, setting `level = 2` = **banned**. Banned keys fail `canChat()` in every chat rule, so they cannot read or write chat, including with a new account on the same email.
- Clients can't read strikes, edit status freely, report themselves, or skip the warning.

## Known limits
- One human = one account can't be guaranteed: someone can use a different Google email.
- The ban is chat-only on purpose; locking people out of a medication app has safety downsides.
- Emails are stored in `members` / `emailOwners`, so a privacy policy is required (see `src/lib/legal.ts`).
- Medication data is local-only (no cloud backup).

## Themes
Palettes live in `src/lib/theme.ts` (`THEMES`); add a look by adding one entry. Screens use `themedStyles(() => StyleSheet.create(...))` so colours rebuild when the theme changes.

## Releasing
See `RELEASING.md`. GitHub Actions builds a signed APK on every `v*` tag (no Expo account needed). iPhone needs Apple's paid developer program.
