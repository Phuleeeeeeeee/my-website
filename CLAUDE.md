@AGENTS.md

# Quy tắc dự án Việc học của tôi

## Phạm vi hiện tại

Dự án đang thực hiện Assignment 1.

- Chỉ xây dựng frontend.
- Dữ liệu công việc lưu tạm bằng React state.
- Chưa thêm API, Supabase, database hoặc xác thực thật.
- Không dùng localStorage để lưu công việc.
- Không biến form đăng nhập mẫu thành xác thực giả.

## Công nghệ và cấu trúc

- Dùng Next.js App Router.
- Dùng TypeScript và Tailwind CSS đang được cài trong dự án.
- Đọc hướng dẫn Next.js đi kèm phiên bản hiện tại trước khi sửa code.
- Không tự nâng cấp hoặc thay thế dependency nếu chưa cần thiết.
- Giữ cấu trúc component rõ ràng.

## Thiết kế

- Giữ tài liệu tham chiếu trong design/stitch.
- Không nhúng CDN Tailwind hoặc script từ HTML Stitch vào ứng dụng.
- Kiểm tra giao diện desktop và mobile 390 px.
- Input có label.
- Nút thao tác được bằng bàn phím và có trạng thái focus.
- Các chức năng chưa hỗ trợ phải được trình bày rõ.

## Dữ liệu nhạy cảm

- Không đọc hoặc in nội dung .env.local.
- Không ghi mật khẩu hoặc token vào log.
- Không đưa thông tin bí mật vào source hoặc tài liệu nộp bài.

## Kiểm tra sau thay đổi

- Nêu những file đã thay đổi và lý do.
- Chạy lint, TypeScript và build khi phù hợp.
- Kiểm tra các thao tác liên quan trên trình duyệt.
- Ghi trung thực phần đã đạt, chưa đạt hoặc chưa kiểm tra.