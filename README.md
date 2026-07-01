# Personal Money Manager (Ứng dụng Quản lý Chi tiêu Cá nhân)

Ứng dụng **Money Manager** là một hệ thống full-stack hoàn chỉnh giúp người dùng theo dõi thu nhập, quản lý chi tiêu và thiết lập hạn mức ngân sách hằng tháng một cách thông minh, trực quan.

---

## 🚀 Demo & Deployment Links
* **Ứng dụng Frontend (Vercel)**: *(Vui lòng cập nhật link sau khi deploy)*
* **API Backend (Render/FastAPI)**: *(Vui lòng cập nhật link sau khi deploy)*
* **Tài liệu API (Swagger UI)**: `${BACKEND_URL}/docs`

---

## 🛠️ Công nghệ Sử dụng

### 1. Backend (Python)
* **Framework**: **FastAPI** (Hiệu năng vượt trội, tự động sinh tài liệu Swagger UI, xác thực kiểu dữ liệu mạnh mẽ).
* **ORM**: **SQLModel** (Kết hợp Pydantic và SQLAlchemy giúp code an toàn kiểu dữ liệu).
* **Cơ sở dữ liệu**:
  * **SQLite** (Môi trường phát triển cục bộ - cực kỳ dễ khởi tạo, không cần setup server phức tạp).
  * **PostgreSQL** (Neon Postgres - Môi trường production deploy).
* **Xác thực**: JWT (JSON Web Token) kết hợp băm mật khẩu bảo mật cao bằng `bcrypt`.

### 2. Frontend (ReactJS)
* **Framework**: ReactJS với **Vite** và **TypeScript** (Kiểm soát chặt chẽ kiểu dữ liệu, build siêu nhanh).
* **Styling**: **Vanilla CSS** với thiết kế **Sleek Dark Mode**, hiệu ứng **Glassmorphism** và các chuyển động vi mô (micro-animations) mượt mà, responsive tốt trên các thiết bị di động.
* **Biểu đồ**: **Recharts** (Visualizations trực quan biểu đồ tròn phân bổ chi tiêu và biểu đồ cột xu hướng 6 tháng).
* **HTTP Client**: **Axios** tích hợp interceptor để tự động chèn JWT token vào header.

---

## 📦 Kiến trúc & Tổ chức Mã nguồn

Dự án được tổ chức theo mô hình phân lớp rõ ràng để dễ bảo trì và mở rộng:

```text
dika/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── core/             # Cấu hình bảo mật, database, JWT, settings
│   │   ├── models/           # Định nghĩa DB Models (SQLModel) & Request/Response Schemas (Pydantic)
│   │   ├── routers/          # Các API endpoints chia theo module (auth, categories, transactions, budgets, statistics)
│   │   └── main.py           # Điểm khởi chạy ứng dụng, cấu hình CORS & Startup hooks
│   ├── requirements.txt      # Dependencies của Python
│   └── money_manager.db      # SQLite database cục bộ (tự động tạo khi chạy backend)
│
└── frontend/                 # ReactJS Frontend
    ├── src/
    │   ├── components/       # Các component dùng chung (Layout, Sidebar, v.v.)
    │   ├── context/          # Quản lý state toàn cục (AuthContext)
    │   ├── pages/            # Các trang chức năng chính (Login, Register, Dashboard, Transactions, Budgets)
    │   ├── services/         # Axios API Client cấu hình interceptors
    │   ├── index.css         # Hệ thống CSS toàn cục (Dark theme, glassmorphism, variables)
    │   ├── App.tsx           # Quản lý React Router
    │   └── main.tsx          # Khởi tạo React App
    ├── package.json          # Dependencies của Frontend
    └── vite.config.ts        # Cấu hình Vite
```

---

## ✨ Các Tính năng Cốt lõi

1. **Xác thực Người dùng (Auth)**:
   * Đăng ký tài khoản mới & Tự động khởi tạo bộ danh mục thu/chi mặc định.
   * Đăng nhập an toàn bằng JWT.
   * Duy trì phiên đăng nhập sau khi reload trang.

2. **Bảng điều khiển (Dashboard)**:
   * Thống kê trực quan: Số dư hiện tại, Tổng thu nhập, Tổng chi tiêu trong tháng đang lọc.
   * Biểu đồ tròn phân bổ chi tiêu theo danh mục (tự động tính phần trăm).
   * Biểu đồ cột xu hướng tài chính (so sánh Thu nhập vs Chi tiêu qua 6 tháng gần nhất).
   * Danh sách Giao dịch gần đây (5 giao dịch mới nhất).
   * Tiến độ Ngân sách tháng hiện tại của từng danh mục.
   * **Cảnh báo Thông minh**: Tự động hiển thị cảnh báo nổi bật trên Dashboard nếu chi tiêu của danh mục nào đạt từ **80%** (màu cam) hoặc vượt quá **100%** (màu đỏ) hạn mức ngân sách đã đặt.

3. **Quản lý Giao dịch (Transactions)**:
   * Danh sách giao dịch hiển thị rõ ràng, phân biệt Thu (+) / Chi (-) bằng màu sắc và icon.
   * Bộ lọc nâng cao: Lọc theo Loại (Thu/Chi), Danh mục, và Khoảng thời gian tự chọn.
   * Thêm mới, Sửa thông tin, Xóa giao dịch trực quan qua các popup Modal.

4. **Hạn mức Ngân sách (Budgets)**:
   * Thiết lập/Thay đổi hạn mức chi tiêu cho từng danh mục riêng biệt theo từng Tháng/Năm.
   * Thanh tiến trình (Progress Bar) đổi màu linh hoạt phản ánh trực quan mức độ chi tiêu.
   * Tự động tính toán số tiền đã chi tiêu thực tế và số tiền còn lại trong hạn mức.

---

## 🛠️ Hướng dẫn Khởi chạy Cục bộ (Local Setup)

### Yêu cầu hệ thống
* Python 3.9 trở lên
* Node.js v18 trở lên & npm

### 1. Chạy Backend (FastAPI)
1. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Tạo môi trường ảo và kích hoạt:
   * **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```
4. Khởi động server phát triển:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   * Server sẽ chạy tại: `http://localhost:8000`
   * Tài liệu Swagger UI tự động sinh tại: `http://localhost:8000/docs`
   * Cơ sở dữ liệu SQLite `money_manager.db` sẽ được tự động tạo và chạy migrations khi server khởi chạy lần đầu.

### 2. Chạy Frontend (ReactJS)
1. Di chuyển vào thư mục `frontend`:
   ```bash
   cd ../frontend
   ```
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Chạy ứng dụng ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   * Ứng dụng sẽ chạy tại: `http://localhost:5173`
   * Mặc định Frontend sẽ kết nối với API cục bộ tại `http://localhost:8000/api`.

---

## 🌐 Hướng dẫn Triển khai (Deployment Guide)

### 1. Database Cloud (PostgreSQL)
1. Đăng ký tài khoản miễn phí trên [Neon Tech](https://neon.tech/) hoặc [Supabase](https://supabase.com/).
2. Tạo một database PostgreSQL mới và copy chuỗi Connection String (`postgres://...`).

### 2. Backend (Render / Koyeb / Fly.io)
1. Đẩy code lên GitHub repository (public).
2. Tạo một Web Service trên Render liên kết với repo GitHub đó.
3. Cấu hình các thông số build:
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Thêm các Biến môi trường (Environment Variables):
   * `DATABASE_URL`: Dán chuỗi kết nối PostgreSQL của Neon/Supabase vào đây. (FastAPI sẽ tự động sử dụng DB Postgres thay vì SQLite cục bộ).
   * `SECRET_KEY`: Một chuỗi ngẫu nhiên bảo mật để mã hóa JWT.

### 3. Frontend (Vercel / Netlify)
1. Tạo một dự án mới trên Vercel liên kết với repo GitHub.
2. Thiết lập thư mục gốc (Root Directory) là `frontend`.
3. Thêm Biến môi trường:
   * `VITE_API_URL`: URL của backend đã deploy trên Render (ví dụ: `https://money-manager-backend.onrender.com/api`).
4. Bấm **Deploy**. Vercel sẽ tự động build và cung cấp link truy cập public.
