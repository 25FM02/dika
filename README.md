# Personal Money Manager (Ứng dụng Quản lý Chi tiêu Cá nhân)

Ứng dụng **Money Manager** là một hệ thống full-stack hoàn chỉnh giúp người dùng theo dõi thu nhập, quản lý chi tiêu, thiết lập hạn mức ngân sách hằng tháng và quản lý mục tiêu tiết kiệm dài hạn một cách thông minh, trực quan.

---

## 🚀 Demo & Deployment Links
* **Ứng dụng Frontend (Vercel)**: [https://dika-fe.vercel.app/](https://dika-fe.vercel.app/)
* **API Backend (Render/FastAPI)**: [https://dika-be.onrender.com/](https://dika-be.onrender.com/)
* **Tài liệu API (Swagger UI)**: [https://dika-be.onrender.com/docs](https://dika-be.onrender.com/docs)

---

## 🛠️ Công nghệ Sử dụng

### 1. Backend (Python)
* **Framework**: **FastAPI** (Hiệu năng vượt trội, tự động sinh tài liệu Swagger UI, xác thực kiểu dữ liệu mạnh mẽ).
* **ORM**: **SQLModel** (Kết hợp Pydantic và SQLAlchemy giúp kiểm soát kiểu dữ liệu đồng nhất từ DB lên API).
* **Cơ sở dữ liệu**:
  * **SQLite** (Phục vụ phát triển cục bộ - nhanh gọn, tự động tạo file database).
  * **PostgreSQL** (Neon Postgres - Hệ quản trị CSDL đám mây cho môi trường production).
* **Xác thực**: JWT (JSON Web Token) kết hợp băm mật khẩu bảo mật bằng `bcrypt`.

### 2. Frontend (ReactJS)
* **Framework**: ReactJS với **Vite** và **TypeScript** (Kiểm soát chặt chẽ kiểu dữ liệu, build siêu nhanh).
* **Styling**: **Vanilla CSS** với thiết kế **Light Theme mặc định** ngọc trai sang trọng, hỗ trợ glassmorphism và các hiệu ứng micro-animations mượt mà, tối ưu hóa hiển thị (responsive) cho cả máy tính và di động.
* **Biểu đồ**: **Recharts** (Visualizations trực quan biểu đồ tròn phân bổ chi tiêu và biểu đồ cột xu hướng tài chính).
* **HTTP Client**: **Axios** tích hợp interceptor để tự động chèn JWT token vào header và xử lý an toàn lưu trữ ở chế độ ẩn danh (Incognito).

---

## 📦 Kiến trúc & Tổ chức Mã nguồn (Module-based)

Dự án được tái cấu trúc theo mô hình **Module-based** (Domain-Driven) giúp hệ thống tự quản lý logic độc lập, dễ bảo trì và mở rộng:

```text
dika/
├── backend/                       # Python FastAPI Backend
│   ├── app/
│   │   ├── core/                  # Cấu hình bảo mật, cấu hình database, thông điệp lỗi chung
│   │   ├── services/              # Các Domain Services tự quản lý logic nghiệp vụ, models, constants riêng
│   │   │   ├── auth/              # Xác thực, đăng ký, đăng nhập & Model User
│   │   │   ├── category/          # Danh mục thu/chi
│   │   │   ├── transaction/       # Giao dịch phát sinh
│   │   │   ├── budget/            # Hạn mức ngân sách
│   │   │   ├── statistics/        # Phân tích dữ liệu & Báo cáo
│   │   │   └── savings/           # [NEW] Quản lý mục tiêu tiết kiệm
│   │   ├── routers/               # Các API Endpoints định tuyến gọi trực tiếp các Domain Services tương ứng
│   │   └── main.py                # Điểm khởi chạy ứng dụng, cấu hình CORS & Startup hooks
│   ├── requirements.txt           # Dependencies của Python (đã tích hợp psycopg2-binary cho PostgreSQL)
│   └── .python-version            # Chỉ định phiên bản Python 3.11.8 cho Render
│
└── frontend/                      # ReactJS Frontend
    ├── src/
    │   ├── components/            # Component dùng chung (Layout, Sidebar điều hướng)
    │   ├── context/               # Quản lý state toàn cục (AuthContext)
    │   ├── pages/                 # Các trang chức năng (Login, Register, Dashboard, Transactions, Budgets, Savings)
    │   ├── services/              # API Client & Services chia theo các folder Domain tương tự backend
    │   │   ├── auth/
    │   │   ├── category/
    │   │   ├── transaction/
    │   │   ├── budget/
    │   │   ├── statistics/
    │   │   ├── savings/           # [NEW] Client Service gọi các API tiết kiệm
    │   │   ├── api.ts             # Axios client tự động chuẩn hóa URL API
    │   │   └── storage.ts         # [NEW] Bộ nhớ đệm dự phòng chống crash localStorage ở tab ẩn danh
    │   ├── index.css              # CSS toàn cục (Light theme mặc định, variables, modal layout)
    │   ├── App.tsx                # Quản lý React Router điều hướng
    │   └── main.tsx               # Khởi tạo React App
    └── package.json               # Dependencies của Frontend
```

---

## ✨ Các Tính năng Cốt lõi

1. **Xác thực Người dùng (Auth)**:
   * Đăng ký tài khoản mới & Tự động khởi tạo bộ danh mục thu/chi mặc định.
   * Đăng nhập an toàn bằng JWT. Hỗ trợ cơ chế dự phòng bộ nhớ RAM nếu trình duyệt ẩn danh (Incognito) chặn `localStorage`.

2. **Bảng điều khiển (Dashboard)**:
   * Thống kê: Số dư ví, Tổng thu nhập, Tổng chi tiêu trong tháng.
   * Biểu đồ tròn phân bổ chi tiêu theo danh mục.
   * Biểu đồ cột xu hướng tài chính (so sánh Thu nhập vs Chi tiêu qua 6 tháng gần nhất).
   * Tiến độ Ngân sách tháng hiện tại của từng danh mục và **Cảnh báo Chi tiêu vượt hạn mức** (>80% màu cam, >100% màu đỏ).

3. **Quản lý Giao dịch (Transactions)**:
   * Danh sách giao dịch hiển thị rõ ràng, phân biệt Thu (+) / Chi (-) bằng màu sắc và icon.
   * Bộ lọc nâng cao theo Loại, Danh mục, và Khoảng thời gian.

4. **Hạn mức Ngân sách (Budgets)**:
   * Thiết lập hạn mức chi tiêu cho từng danh mục riêng biệt.
   * Tự động tính toán số tiền đã chi tiêu thực tế và số tiền còn lại.

5. **[NEW] Quản lý Mục tiêu Tiết kiệm (Savings Goals)**:
   * Thiết lập các mục tiêu tài chính dài hạn (Mua laptop, Quỹ khẩn cấp, Đi du lịch).
   * **Dòng tiền tự động**:
     * Khi **Nạp tích lũy**: Cộng tiền vào mục tiêu tiết kiệm + Tự động tạo giao dịch **Chi tiêu (EXPENSE)** "Tích lũy tiết kiệm" để trừ tiền ví chính.
     * Khi **Rút tiền**: Trừ tiền khỏi mục tiêu tiết kiệm + Tự động tạo giao dịch **Thu nhập (INCOME)** "Rút tiền tiết kiệm" để cộng tiền lại ví chính.
   * Thanh tiến trình trực quan đổi sang màu xanh lá cây khi đạt 100% mục tiêu.

6. **[NEW] Xuất Báo cáo Giao dịch sang CSV (Export to CSV)**:
   * Cho phép tải xuống toàn bộ lịch sử giao dịch dưới dạng file CSV theo bộ lọc hiện tại.
   * Định dạng file hỗ trợ mã **UTF-8 BOM** hiển thị chính xác tiếng Việt có dấu khi mở bằng Microsoft Excel.

---

## 🛠️ Hướng dẫn Khởi chạy Cục bộ (Local Setup)

### Yêu cầu hệ thống
* Python 3.11 trở lên
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
3. Cài đặt các thư viện:
   ```bash
   pip install -r requirements.txt
   ```
4. Khởi động server phát triển:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   * API chạy tại: `http://localhost:8000`
   * Swagger UI tại: `http://localhost:8000/docs`

### 2. Chạy Frontend (ReactJS)
1. Di chuyển vào thư mục `frontend`:
   ```bash
   cd ../frontend
   ```
2. Cài đặt packages và chạy:
   ```bash
   npm install
   npm run dev
   ```
   * Ứng dụng chạy tại: `http://localhost:5173`

---

## 🌐 Hướng dẫn Triển khai (Deployment Guide)

### 1. Database Cloud (Neon.tech)
1. Đăng ký tài khoản trên [Neon Tech](https://neon.tech/) và tạo project PostgreSQL mới.
2. Copy chuỗi Connection String (`postgres://...`).

### 2. Backend (Render)
1. Tạo một **Web Service** trên Render kết nối với repo GitHub của bạn.
2. Thiết lập:
   * **Root Directory**: `backend`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Thêm các **Environment Variables**:
   * `DATABASE_URL`: Dán chuỗi kết nối từ Neon.
   * `SECRET_KEY`: Chuỗi bí mật mã hóa JWT.
   * `PYTHON_VERSION`: `3.11.8` *(Rất quan trọng, để tránh lỗi biên dịch greenlet trên phiên bản thử nghiệm 3.14)*.

### 3. Frontend (Vercel)
1. Tạo một dự án trên Vercel kết nối với repo GitHub.
2. Thiết lập:
   * **Root Directory**: `frontend`
   * **Framework Preset**: Chọn `Vite`.
3. Thêm biến môi trường **Environment Variable**:
   * `VITE_API_URL`: URL Backend của bạn từ Render (ví dụ: `https://dika-be.onrender.com/api`).

---

## 🔮 Định hướng Phát triển Các Dịch vụ Tương lai (Future Services Roadmap)

Để nâng tầm hệ thống quản lý tài chính cá nhân thành một siêu ứng dụng (Super App) hỗ trợ quản lý tài sản toàn diện, dưới đây là định hướng thiết kế và phát triển cho 6 dịch vụ tiếp theo trong kiến trúc Microservices/Module-based:

### 1. Dịch vụ Giao dịch Định kỳ (Recurring Transactions Service)
* **Ý tưởng**: Tự động hóa việc ghi nhận các khoản thu/chi lặp đi lặp lại cố định như tiền thuê nhà, đăng ký Netflix, thanh toán internet, trả lương hằng tháng.
* **Giải pháp kỹ thuật**:
  * Backend bổ sung bảng `RecurringPattern` quản lý chu kỳ (Hằng ngày, Hằng tuần, Hằng tháng).
  * Sử dụng thư viện lập lịch **Celery** kết hợp với **Redis Broker** (hoặc APScheduler chạy nền) để quét và tự động tạo bản ghi `Transaction` mới khi đến hạn.
  * Tích hợp gửi email thông báo nhắc trước cho người dùng 1 ngày trước khi trừ tiền.

### 2. Trợ lý Ảo & Cố vấn Tài chính AI (AI-Powered Financial Advisor)
* **Ý tưởng**: Phân tích thói quen chi tiêu thực tế của người dùng và đưa ra lời khuyên cá nhân hóa nhằm cắt giảm chi phí thừa và đạt mục tiêu tiết kiệm nhanh hơn.
* **Giải pháp kỹ thuật**:
  * Xây dựng module AI kết nối với API **Google Gemini** (hoặc Open AI).
  * Định kỳ tổng hợp dữ liệu chi tiêu hàng tuần của người dùng làm context (đã mã hóa ẩn danh thông tin cá nhân), gửi prompt yêu cầu AI phân tích và đưa ra gợi ý hành vi tài chính.
  * Hiển thị báo cáo lời khuyên AI trực tiếp trên màn hình Dashboard và gửi Notification định kỳ sáng thứ Hai.

### 3. Dịch vụ Quản lý Nợ & Cho vay (Debt & Loan Tracking Service)
* **Ý tưởng**: Quản lý độc lập các khoản đi vay (liên đới nợ phải trả) và khoản cho người khác vay (liên đới khoản phải thu) để cập nhật chính xác tổng giá trị tài sản ròng (Net Worth).
* **Giải pháp kỹ thuật**:
  * Phát triển thực thể `DebtLoan` mới, liên kết với từng đối tác/người mượn trong danh bạ.
  * Khi người dùng trả bớt nợ hoặc thu hồi nợ, hệ thống sẽ tự động tạo Transaction tương ứng và cập nhật trạng thái số dư khoản nợ.
  * Thiết lập nút nhắc nhở đòi nợ nhanh qua SMS/Zalo.

### 4. Dịch vụ Chia sẻ Chi phí Nhóm (Group Expense Splitter)
* **Ý tưởng**: Cho phép các nhóm (bạn cùng phòng, nhóm đi du lịch, gia đình) ghi chép chung các khoản chi, tự động tính toán bù trừ và chia đều công nợ (tương tự như Splitwise).
* **Giải pháp kỹ thuật**:
  * Phát triển thực thể `Group` và `GroupMember`.
  * Mỗi giao dịch nhóm sẽ có cấu hình tỷ lệ chia (chia đều, chia theo phần trăm hoặc số tiền cụ thể).
  * Xây dựng thuật toán tối ưu hóa luồng thanh toán (Simplify debts algorithm) để giảm thiểu tối đa số lượng giao dịch cần chuyển khoản qua lại giữa các thành viên.

### 5. Quản lý Ví Đa Tiền tệ & Tài sản (Multi-Currency & Asset Wallet)
* **Ý tưởng**: Hỗ trợ người dùng lưu trữ và ghi nhận giao dịch bằng nhiều đơn vị tiền tệ (VND, USD, EUR) hoặc các loại tài sản đầu tư khác (Vàng, Chứng khoán, Crypto).
* **Giải pháp kỹ thuật**:
  * Tích hợp API của bên thứ ba để cập nhật tỷ giá hối đoái thực tế (Exchange Rate API) hàng giờ.
  * Quy đổi mọi loại ví tài sản về tiền tệ cơ sở (Base Currency) do người dùng thiết lập để hiển thị tổng tài sản ròng chính xác trên Dashboard.

### 6. Đồng bộ Giao dịch Tự động (Bank API & SMS Parser Service)
* **Ý tưởng**: Giảm thiểu việc người dùng phải nhập tay giao dịch bằng cách tự động đồng bộ hóa dữ liệu từ biến động số dư ngân hàng.
* **Giải pháp kỹ thuật**:
  * Liên kết với các đối tác Open Banking API tại Việt Nam hoặc xây dựng Mobile Parser Service tự động đọc và phân tích cú pháp tin nhắn thông báo biến động số dư (SMS/Notification từ ứng dụng ngân hàng) trên điện thoại Android/iOS của người dùng.
  * Tự động nhận diện danh mục dựa trên từ khóa nội dung chuyển khoản (ví dụ: "CGV" $\rightarrow$ giải trí, "Grab" $\rightarrow$ di chuyển) bằng công nghệ học máy hoặc Regex rules nâng cao.

