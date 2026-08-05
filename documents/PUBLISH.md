# Hướng dẫn Publish Package `windify-gis` lên NPM

Tài liệu này hướng dẫn các bước chi tiết để chuẩn bị, kiểm tra và phát hành (publish) package `windify-gis` lên NPM repository.

## 1. Yêu cầu thiết yếu

Trước khi bắt đầu, hãy đảm bảo bạn đã:

- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản `>=18.0.0` như quy định trong `package.json`).
- Có tài khoản trên [npmjs.com](https://www.npmjs.com/).
- Có quyền truy cập/publish vào package `windify-gis`.

Đăng nhập vào NPM thông qua terminal:

```bash
npm login
```

_(Bạn sẽ được yêu cầu nhập Username, Password, Email, và OTP nếu bạn bật 2FA)._

## 2. Các bước chuẩn bị và kiểm tra (Pre-publish Checks)

Để đảm bảo mã nguồn an toàn và không có lỗi trước khi phát hành, hãy chạy tuần tự các lệnh sau:

### 2.1. Cài đặt các dependencies mới nhất

```bash
npm install
```

### 2.2. Kiểm tra Format và Code Quality (Lint)

Đảm bảo code tuân thủ các quy tắc format và lint của dự án:

```bash
npm run format:check
npm run lint
```

_(Nếu có lỗi format, hãy chạy `npm run format`. Nếu có lỗi lint, chạy `npm run lint:fix`)_

### 2.3. Chạy Unit Test

Đảm bảo tất cả các test case đều được thông qua (pass):

```bash
npm run test
# Hoặc chạy kiểm tra coverage
npm run test:coverage
```

### 2.4. Đánh giá chất lượng Package (Audit)

Kiểm tra tính hợp lệ của package (các config exports, entry point) và kiểm tra khả năng tree-shaking:

```bash
npm run audit:package
npm run audit:tree-shaking
```

## 3. Build Package

Sau khi tất cả các bài kiểm tra đã pass, hãy tiến hành build mã nguồn:

```bash
npm run build
```

Lệnh này sẽ sử dụng `tsup` để biên dịch mã nguồn TypeScript trong thư mục `src` ra thư mục `dist`. `dist` chứa tất cả các định dạng xuất (`.cjs`, `.mjs`, `.d.ts`) và đây cũng là nội dung duy nhất được đưa lên NPM (đã được cấu hình qua trường `files` trong `package.json`).

## 4. Tăng Phiên bản (Versioning)

Sử dụng `npm version` để tăng phiên bản của package theo chuẩn [Semantic Versioning (SemVer)](https://semver.org/):

- **Bản vá lỗi (Patch)** (Chỉ sửa lỗi nhỏ, không thay đổi tính năng):
  ```bash
  npm version patch
  ```
- **Bản cải tiến (Minor)** (Thêm tính năng mới, không phá vỡ tính năng cũ):
  ```bash
  npm version minor
  ```
- **Bản thay đổi lớn (Major)** (Có những thay đổi có thể phá vỡ tính tương thích - Breaking Changes):
  ```bash
  npm version major
  ```

Lệnh này sẽ tự động cập nhật version mới nhất vào file `package.json` và tạo một `git commit` kèm theo `tag` (nếu dự án đang dùng Git).

## 5. Phát hành (Publish)

### 5.1. Dry Run (Kiểm tra trước - Tùy chọn nhưng Khuyên dùng)

Nếu bạn muốn xem chính xác những file nào sẽ được đóng gói và tải lên NPM mà không thực sự publish, hãy dùng cờ `--dry-run`:

```bash
npm publish --dry-run
```

### 5.2. Publish chính thức

Đẩy package lên NPM registry:

```bash
npm publish
```

_Lưu ý: Nếu package name của bạn được scoped (có `@tên-org/` ở trước) thì ở lần publish đầu tiên, NPM mặc định set nó thành `private`. Để publish public, bạn cần chạy: `npm publish --access public`._

## 6. Các thao tác sau khi Publish

Sau khi publish thành công:

1. Đẩy các thay đổi (commit version và tag) lên repository:
   ```bash
   git push --follow-tags
   ```
2. Bạn có thể lên trang [npmjs.com/package/windify-gis](https://www.npmjs.com/package/windify-gis) để kiểm tra package vừa mới được xuất bản.

---

## 7. Phát hành Tự động qua GitHub Actions (CI/CD)

Dự án này đã được cấu hình sẵn workflow CI/CD thông qua GitHub Actions tại file `.github/workflows/publish.yml`. Đây là **phương pháp được khuyên dùng** (Best Practice) để đảm bảo mọi quy trình kiểm tra được chạy tự động và ổn định trên server.

### 7.1. Yêu cầu thiết lập ban đầu (Chỉ làm 1 lần)

NPM hiện tại khuyến cáo sử dụng **Trusted Publishing (OIDC)** thay vì tạo Automation Token (vì lý do bảo mật rủi ro cao). Với Trusted Publishing, bạn không cần phải copy/paste token thủ công vào GitHub Secrets nữa.

Tuy nhiên, **NPM yêu cầu package phải tồn tại trên hệ thống thì mới cài đặt được tính năng này**. Do đó quy trình thiết lập như sau:

1. **Publish thủ công lần đầu**: Tại máy của bạn, hãy chạy lệnh `npm publish` (hoặc `npm publish --access public`) để tạo package trên NPM lần đầu tiên.
2. Đăng nhập vào trang [npmjs.com](https://www.npmjs.com/).
3. Trỏ tới trang quản lý package bạn vừa tạo.
4. Chuyển sang tab **Settings** > **Publishing Access** > **Add a Trusted Publisher**.
5. Nhập thông tin GitHub Repository của bạn (Tài khoản/Organization GitHub và Tên Repository).
6. Bấm **Add**.

Kể từ các phiên bản sau, GitHub Actions của repo này sẽ tự động đàm phán với NPM (qua OIDC) để lấy quyền publish mà không cần dùng `NPM_TOKEN`!

### 7.2. Quy trình Publish tự động (Cách chuẩn)

Để publish phiên bản mới, bạn chỉ cần thay đổi version và push lên GitHub. Mọi thứ còn lại sẽ được tự động hóa.

**Bước 1: Tăng phiên bản & Tạo Tag**
Ở nhánh `main` (sau khi code đã được merge hoàn tất), chạy lệnh:

```bash
# Ví dụ: cập nhật bản patch
npm version patch
```

_(Lệnh này tự động tăng version trong package.json, tạo git commit và git tag tương ứng, ví dụ `v1.0.1`)_

**Bước 2: Đẩy Code và Tag lên GitHub**

```bash
git push --follow-tags
```

**Kết quả:**
Ngay khi tag (có định dạng `v*`) được đẩy lên GitHub, workflow **Publish Package to NPM** sẽ tự động kích hoạt:

- Setup Node.js.
- Cài đặt dependencies (`npm ci`).
- Chạy unit test (`npm run test:coverage`) và audit package.
- Chạy build (`npm run build`).
- Tự động thực hiện `npm publish` qua giao thức bảo mật OIDC (kèm theo cờ `--provenance` giúp đánh dấu package được build tự động từ mã nguồn nào trên GitHub).

### 7.3. Kích hoạt thủ công trên giao diện GitHub (Manual Trigger)

Do workflow có hỗ trợ `workflow_dispatch`, bạn cũng có thể kích hoạt publish bằng tay:

1. Mở Repository trên GitHub, chuyển sang tab **Actions**.
2. Chọn workflow **Publish Package to NPM** ở cột bên trái.
3. Bấm vào nút **Run workflow** ở góc phải màn hình, chọn nhánh (như `main`) và bấm chạy.
