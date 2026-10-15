# Việc học của tôi

Dự án Assignment 1 xây dựng giao diện quản lý công việc học tập
bằng Next.js, TypeScript và Tailwind CSS.

Giao diện được tham chiếu từ thiết kế Stitch.

## 1. Phạm vi bài thực hành

- Trang /login là giao diện đăng nhập mẫu.
- Trang /tasks hỗ trợ thêm, sửa, hoàn thành, xóa và lọc công việc.
- Công việc được lưu tạm bằng React state.
- Tải lại trang sẽ đưa danh sách về dữ liệu mẫu ban đầu.
- Chưa có API, cơ sở dữ liệu hoặc xác thực tài khoản thật.
- Không dùng localStorage để lưu công việc.
- Trạng thái lỗi và đang tải chỉ dùng để minh họa giao diện.

## 2. Công nghệ

- Next.js và App Router.
- React.
- TypeScript.
- Tailwind CSS.
- ESLint.

Phiên bản thư viện được khai báo trong package.json
và được cố định qua package-lock.json.

## 3. Cài đặt

Mở Terminal tại thư mục có file package.json:

```bash
npm ci
```

Lệnh npm ci cài thư viện theo package-lock.json.

## 4. Chạy dự án

```bash
npm run dev
```

Mở các địa chỉ:

- http://localhost:3000/login
- http://localhost:3000/tasks

Trang / tự chuyển sang /tasks.

Nếu cổng 3000 đang bận, dùng địa chỉ mà Terminal thông báo.

## 5. Kiểm tra kỹ thuật

Chạy lần lượt:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Dự án sử dụng font Inter qua next/font/google.
Quá trình build cần truy cập Google Fonts để tải font.

## 6. Chạy bản production tại máy

Sau khi npm run build thành công:

```bash
npm run start
```

Dừng máy chủ đang dùng cùng cổng trước khi chạy lệnh này.

## 7. Chức năng

### Trang đăng nhập

- Hiển thị ô email và mật khẩu mẫu.
- Cho phép hiện hoặc ẩn mật khẩu.
- Có trạng thái lỗi minh họa.
- Có liên kết sang trang công việc.
- Không gửi hoặc lưu mật khẩu để xác thực.

### Trang công việc

- Thêm công việc.
- Sửa tên công việc.
- Đánh dấu hoàn thành.
- Xóa có xác nhận.
- Lọc tất cả, chưa xong và đã xong.
- Kiểm tra tên sau khi loại bỏ khoảng trắng đầu và cuối.
- Chấp nhận tên từ 1 đến 120 ký tự theo phép kiểm tra length.
- Hiển thị lỗi sát ô nhập.
- Hiển thị danh sách rỗng.
- Cho phép xem trạng thái rỗng, đang tải và lỗi minh họa.

## 8. Cấu trúc thư mục

```text
src/app/             Các trang và bố cục chung
src/components/      Các component giao diện
public/              Tài nguyên tĩnh
design/stitch/       Thiết kế tham chiếu
screenshots/         Ảnh minh chứng kết quả
```

## 9. Công cụ AI

Stitch được dùng để chuẩn bị thiết kế tham chiếu.
Codex được dùng để hỗ trợ phân tích và chỉnh sửa mã nguồn.

Người thực hiện đọc lại mã nguồn, chạy các lệnh kiểm tra
và kiểm thử thao tác trên trình duyệt.

## 10. Tài liệu kèm theo

- ASSIGNMENT_1_REPORT.md: báo cáo nội dung thực hiện.
- ASSIGNMENT_1_CHECKLIST.md: danh sách kiểm tra trước khi nộp.
- design/stitch/README.md: mô tả thiết kế tham chiếu.
- screenshots/: ảnh ứng dụng chạy thực tế.

## 11. Thông tin môi trường kiểm tra

Điền kết quả thực tế trước khi nộp:

- Ngày kiểm tra:
- Hệ điều hành:
- Trình duyệt:
- Node.js:
- npm:
- Git:

Lấy phiên bản bằng:

```bash
node --version
npm --version
git --version
npm ls next react react-dom tailwindcss
```