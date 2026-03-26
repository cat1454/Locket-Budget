# Locket Budget - Development Roadmap

Tai lieu nay dung de bam sat qua trinh thuc hien du an theo tung giai doan. Nguyen tac la chi chuyen sang giai doan tiep theo khi giai doan hien tai da dat tieu chi hoan thanh.

## 1. Nguyen tac trien khai

- Uu tien feature tao gia tri cot loi truoc.
- Moi giai doan deu phai co ban demo chay duoc.
- UI, data, business rule va testing phai di cung nhau.
- Khong nhay sang challenge, badge, AI neu luong ghi chi tieu co ban chua on.

## 2. Tong quan cac giai doan

| Giai doan | Muc tieu | Dau ra chinh |
|---|---|---|
| Phase 0 | Chot nen tang, scope va bo khung du an | Repo structure, theme, navigation, data model co ban |
| Phase 1 | Hoan thanh MVP photo-first expense tracker | Auth, add expense, timeline, detail, edit/delete, stats |
| Phase 2 | Tang do gan bo va gia tri su dung hang ngay | Mood, reminder, widget data, insight don gian |
| Phase 3 | Them gamification va thong minh | Challenge, badge, category suggestion, analytics nang cao |

## 3. Phase 0 - Foundation

### 3.1. Muc tieu

Tao bo khung ky thuat va trai nghiem ban dau de cac phase sau phat trien nhat quan.

### 3.2. Cong viec can lam

- Chon stack cong nghe.
- Chot cau truc thu muc du an.
- Chot design direction cho mobile-first UI.
- Dinh nghia entity co ban: User, Expense, Category.
- Dinh nghia navigation chinh.
- Xac dinh cach luu anh.
- Chot quy tac format tien te, ngay gio.

### 3.3. Dau ra bat buoc

- App khoi tao duoc.
- Co routing/navigation co ban.
- Co theme mau, typography, component pattern.
- Co schema du lieu hoac model dau tien.
- Co danh sach category mac dinh.
- Co tai lieu `IDEA.md` va `ROADMAP.md`.

### 3.4. Tieu chi hoan thanh

- Nguoi phat trien co the bat tay vao implement MVP ma khong can tranh luan lai scope.
- Moi man hinh MVP da duoc liet ke ro.
- Data model khong mau thuan voi user flow core.

### 3.5. Trang thai da thuc hien

- Stack da chot: Expo + React Native + TypeScript.
- Repo da tach theo huong docs o root, app nam trong `mobile/`.
- Da co navigation shell gom welcome, login, register, home, timeline, stats, profile.
- Da co man hinh khung cho add expense va expense detail.
- Da co theme mau, category mac dinh, mock data va domain model de sang Phase 1.
- Da typecheck thanh cong bang `npm run typecheck`.

## 4. Phase 1 - MVP

### 4.1. Muc tieu

Hoan thanh mot ung dung co the demo duoc gia tri cot loi: ghi lai chi tieu bang anh va xem lai theo timeline.

### 4.2. Feature can co

- Dang ky.
- Dang nhap.
- Dang xuat.
- Tao khoan chi moi bang chup anh hoac chon anh.
- Nhap so tien.
- Nhap ghi chu ngan.
- Chon danh muc.
- Luu ngay gio.
- Xem timeline.
- Xem chi tiet khoan chi.
- Sua khoan chi.
- Xoa khoan chi.
- Xem tong chi theo ngay, tuan, thang.

### 4.3. Cong viec backend/data

- Tao bang User.
- Tao bang Expense.
- Tao bang Category.
- Viet logic luu va lay danh sach khoan chi theo user.
- Viet logic tinh tong chi theo ngay, tuan, thang.
- Xu ly upload anh hoac luu URI anh tuy stack.

### 4.4. Cong viec frontend

- Man hinh Login/Register.
- Home dashboard co tom tat hom nay.
- Man hinh Add Expense.
- Timeline item co anh, so tien, note ngan, thoi gian.
- Man hinh Detail va Edit.
- UI xac nhan xoa.
- Empty state va error state.

### 4.5. Business rule can khoa

- So tien > 0.
- Danh muc bat buoc.
- Expense chi thuoc ve user dang dang nhap.
- Khong cho luu trung khi bam nut nhieu lan.
- Sau khi xoa, thong ke phai cap nhat dung.

### 4.6. Tieu chi hoan thanh

- Nguoi dung dang ky va dang nhap duoc.
- Tao duoc expense moi co anh.
- Expense xuat hien dung trong timeline.
- Tong chi hom nay, tuan nay, thang nay chinh xac.
- Sua va xoa expense on dinh.
- Demo tron ven mot luong su dung tu dang nhap den xem thong ke.

### 4.7. Nhung gi chua lam trong phase nay

- Mood spending.
- Widget.
- Challenge.
- Badge.
- AI suggestion.

### 4.8. Trang thai da thuc hien

- Da co dang ky, dang nhap, dang xuat theo local auth.
- Session va du lieu user/expense duoc luu bang AsyncStorage.
- Da them khoan chi moi voi anh, so tien, ghi chu, danh muc va ngay gio luu.
- Da co timeline du lieu that, expense detail, sua va xoa.
- Da co thong ke tong chi hom nay, tuan nay, thang nay va top category.
- Da typecheck thanh cong sau khi noi xong toan bo flow MVP.

## 5. Phase 2 - Delight and Retention

### 5.1. Muc tieu

Tang muc do quay lai su dung hang ngay va lam cho ung dung "co tinh cach" hon, khong chi la mot cong cu ghi chep.

### 5.2. Feature uu tien

- Mood spending cho moi expense.
- Insight don gian theo mood va danh muc.
- Nhac nho nhap chi tieu trong ngay.
- Widget data provider de hien thi tong quan nhanh.

### 5.3. Cong viec can lam

- Them entity Mood hoac enum mood.
- Cap nhat form Add Expense de chon mood.
- Tinh thong ke: mood nao di kem muc chi cao nhat, khung gio chi nhieu nhat, danh muc chi nhieu nhat.
- Them cai dat thong bao nhac nho.
- Chuan bi source du lieu cho widget.

### 5.4. Tieu chi hoan thanh

- Mood duoc luu cung expense.
- Co man hinh thong ke/insight co y nghia, khong chi la placeholder.
- Reminder co the bat/tat.
- Widget hoac toi thieu la widget-ready data layer da duoc thiet ke.

### 5.5. Luu y

Phase 2 chi co y nghia khi user da tao du lieu deu. Neu MVP chua on dinh thi khong nen day nhanh phase nay.

## 6. Phase 3 - Gamification and Intelligence

### 6.1. Muc tieu

Tao dong luc thay doi hanh vi va tang gia tri khac biet cho san pham.

### 6.2. Feature uu tien

- Challenge tiet kiem.
- Badge / album thanh tich.
- Goi y danh muc tu ghi chu hoac anh.
- Phan tich sau hon ve thoi quen chi tieu.

### 6.3. Cong viec can lam

- Tao model Challenge, UserChallenge, Badge.
- Viet rule engine don gian de tinh tien do challenge.
- Tao UI tham gia challenge va xem tien do.
- Hien thi badge da mo khoa.
- Them goi y danh muc tu keyword note.
- Mo rong ve sau thanh OCR/AI neu can.

### 6.4. Tieu chi hoan thanh

- User tham gia challenge duoc.
- He thong tu cap nhat tien do.
- Badge mo khoa dung dieu kien.
- Goi y danh muc co the dung trong nhieu truong hop co ban.

## 7. Thu tu uu tien khi bat tay vao code

Neu bat dau lap trinh ngay, nen di theo thu tu sau:

1. Khoi tao app va navigation.
2. Tao theme UI va component co ban.
3. Implement auth.
4. Tao data model Expense va Category.
5. Lam man hinh Add Expense.
6. Lam timeline.
7. Lam detail, edit, delete.
8. Lam tong chi theo ngay, tuan, thang.
9. Kiem thu luong chinh.
10. Sau khi MVP on dinh moi sang mood, reminder va widget.

## 8. Definition of Done cho moi feature

Moi feature chi duoc xem la xong khi dap ung du cac dieu kien sau:

- Co UI hoan chinh.
- Co business rule ro rang.
- Co xu ly loading, empty, error.
- Co du lieu luu va doc dung.
- Co test tay hoac test ky thuat cho luong chinh.
- Khong lam vo luong core khac.

## 9. Rui ro chinh can tranh

- Mo rong feature qua som khi MVP chua xong.
- Qua dau tu vao animation trong khi luong tao expense con cham.
- Khong chot ro anh co bat buoc hay khong.
- Data model khong tinh truoc cho mood/challenge nen ve sau phai sua lon.
- Widget va AI duoc dua vao som lam tang do phuc tap khong can thiet.

## 10. Cach su dung tai lieu nay trong qua trinh lam project

- Moi khi bat dau mot phase, doi chieu lai pham vi trong file nay.
- Neu muon them feature moi, phai xac dinh no thuoc phase nao.
- Neu feature khong phuc vu gia tri cot loi, khong dua vao MVP.
- Sau moi phase, cap nhat lai trang thai hoan thanh trong roadmap.

## 11. Moc tiep theo de thuc hien ngay

Neu tiep tuc phat trien tu repo hien tai, cac buoc tiep theo nen la:

1. Kiem thu tren thiet bi that hoac emulator cho camera va image picker.
2. Them bo test hoac checklist test tay cho luong MVP.
3. Can nhac them date picker neu muon cho sua ngay gio ngay trong MVP.
4. Sau khi MVP on dinh moi chuyen sang Phase 2 voi mood, reminder va insight.
