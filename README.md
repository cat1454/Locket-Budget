# Locket Budget

Locket Budget la mini project quan ly chi tieu ca nhan theo huong `photo-first`.
Thay vi chi ghi so tien, moi khoan chi duoc luu nhu mot `visual diary entry`: anh, so tien, ghi chu, danh muc, thoi gian, va mood.

Muc tieu cua project la ket hop:
- su nhanh gon cua app ghi chi tieu
- su gan gui cua mot photo diary
- kha nang mo rong thanh challenge, widget, group split, va social-lite ve sau

## Product Direction

San pham duoc dinh vi la:
- `capture-first expense tracker`
- `personal expense diary`
- `mobile-first`

Home screen uu tien mo camera ngay khi vao app, de nguoi dung chup va luu khoan chi trong vai giay.

## Current Status

Repo hien dang o giai doan:
- `Phase 1`: MVP da hoan thanh phan lon
- `Phase 2`: da bat dau voi mood insights va daily reminder flow

Nhung gi da co trong app:
- local auth: register / login / logout
- tao expense bang camera hoac gallery
- quick capture flow + quick expense sheet
- timeline va expense detail
- edit / delete expense
- thong ke ngay / tuan / thang
- mood picker + mood insights
- history sheet tren man capture
- daily reminder preferences + today recap

## Tech Stack

Mobile app nam trong `mobile/` va dung:
- Expo SDK 54
- React Native
- TypeScript
- React Navigation
- AsyncStorage
- expo-camera
- expo-image-picker
- expo-image-manipulator
- expo-notifications

## Repository Structure

```text
.
|-- IDEA.md
|-- ROADMAP.md
|-- README.md
`-- mobile/
    |-- App.tsx
    |-- app.json
    |-- package.json
    `-- src/
        |-- components/
        |-- data/
        |-- navigation/
        |-- screens/
        |-- state/
        |-- theme/
        |-- types/
        `-- utils/
```

## Core Docs

- [IDEA.md](./IDEA.md): product idea, scope, business rules, expansion directions
- [ROADMAP.md](./ROADMAP.md): implementation phases, done criteria, next priorities

## Run The App

```bash
cd mobile
npm install
npm run start
```

Mot so lenh huu ich:

```bash
cd mobile
npm run android
npm run ios
npm run web
npm run typecheck
```

## Android Setup Note

Neu chay tren Android emulator, may can:
- Android Studio
- Android SDK
- `adb` trong `PATH`
- it nhat 1 AVD emulator

Neu may bao loi nhu:
- `Failed to resolve the Android SDK path`
- `'adb' is not recognized`

thi do la loi moi truong Android, khong phai loi source code.

## Expo Go / Notifications Note

Project hien co `daily reminder` bang `expo-notifications`.

Luu y:
- `local notifications` van dung duoc trong Expo Go
- `remote push notifications` khong con duoc ho tro day du trong Expo Go Android tu SDK 53
- neu muon test notifications on dinh hon, nen dung `development build`

Tai lieu tham khao chinh thuc:
- https://docs.expo.dev/versions/latest/sdk/notifications/
- https://docs.expo.dev/develop/development-builds/introduction/

## Implemented Product Areas

### 1. Auth
- register
- login
- logout
- session persistence bang AsyncStorage

### 2. Expense Flow
- chup anh hoac chon anh
- crop anh ve khung vuong
- luu amount, category, note, mood
- expense detail
- edit / delete

### 3. Capture UX
- vao app la camera mo san
- pinch to zoom tren preview
- history launcher + history bottom sheet
- quick add sau khi chup

### 4. Analytics
- tong chi hom nay / tuan nay / thang nay
- category summaries
- mood summaries
- top mood insight
- today recap tren Home

### 5. Reminder
- toggle daily reminder trong Profile
- local notification scheduling
- reminder state duoc persist trong app preferences

## Product Roadmap

### Phase 0
- foundation, navigation, theme, domain model

### Phase 1
- MVP expense tracker bang anh

### Phase 2
- mood spending
- reminder
- widget-ready data
- insight de tang retention

### Phase 3
- challenge
- badge
- smart suggestion
- deeper analytics

### Phase 4
- shared expense
- fair split
- debt summary

### Phase 5
- friends
- share moments
- reactions
- social-lite privacy flow

## Development Rules

Project duoc phat trien theo cac nguyen tac:
- uu tien core flow truoc
- khong mo rong social / AI / challenge khi expense flow chua on
- mobile-first va low-friction
- photo la trung tam, statistics la lop ho tro

## Recommended Next Steps

Neu tiep tuc phat trien tu repo hien tai, cac buoc hop ly nhat la:

1. test daily reminder tren thiet bi that hoac development build
2. polish tiep `Home`, `History sheet`, `QuickExpenseSheet`
3. chot widget-ready data cho Phase 2
4. them checklist test tay cho capture -> save -> detail -> stats

## Verification

Kiem tra TypeScript:

```bash
cd mobile
npm run typecheck
```

Neu Metro dang cache code cu:

```bash
cd mobile
npx expo start --clear
```
