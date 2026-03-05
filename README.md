## Real Estate Backend (Graduation Project)

API لخدمة مشروع عقارات (Real Estate) مبني بـ **Node.js + Express + MongoDB** مع:

- **Authentication** (تسجيل، كود تفعيل على الإيميل، تسجيل دخول، نسيان/إعادة تعيين كلمة المرور)
- **Users / Customers** (جلب بيانات المستخدم، وجلب كل المستخدمين للأدمن)
- **Employees** (ربط الموظف بمستخدم + بيانات وظيفية)
- **Properties** (مطابقة لاسكيما SQL: بيع/إيجار + متاح/مباع + صور رئيسية)
- **Transactions + Payments + Installments** (منطق بديل للتريجرز: تحديث المدفوع وتحديث حالة العقار)
- **Favorites**
- **Evaluations**
- **EmailLogs**
- **Tasks**
- **Email sending** عبر `nodemailer`
- **Logging قوي** باستخدام `winston` إلى ملفات
- **JWT Auth + Role-based Authorization**

---

### 1. تشغيل المشروع

#### تثبيت الحزم

```bash
npm install
```

#### إعداد المتغيرات (`.env`)

يجب أن يحتوي ملف `.env` على الأقل على:

- `DB_URL` : رابط MongoDB (Atlas أو local)
- `JWT_SECRET` : string عشوائي وطويل لتوقيع الـ JWT
- `JWT_EXPIRES_IN` : مدة صلاحية التوكن (مثال: `7d`)
- `PORT` : بورت التشغيل (مثل: `5000`)
- `ALLOWED_ORIGINS` : origins المسموح بها للـ CORS (قائمة مفصولة بفواصل)
- `EMAIL_SERVICE` : خدمة الإيميل (مثل: `Gmail`)
- `EMAIL_USER` : إيميل الإرسال
- `EMAIL_PASS` : App Password خاص بالإيميل
- `EMAIL_ADMIN` : إيميل الأدمن لاستقبال تنبيهات المخزون (إن لزم)

#### تشغيل السيرفر

```bash
npm start
```

السيرفر هيشتغل على `http://localhost:5000` (أو حسب قيمة `PORT`) مع base path:

- `http://localhost:5000/api/v1`

---

### 2. اسكيما الداتابيز (للاختبار)

#### 2.1 Users / Customers (`User`)

- **حقول أساسية**:
  - `userName`, `email` (unique), `password` (hashed), `phone_number`, `role` (`Admin | User | Owner | Tenant | Employee`), `roleId`, `address[]`, `isVerified`, `verificationCode`, `resetCode`, `resetCodeExpires`, `isActive`, `createdAt`, `updatedAt`.
- **استخدام في الاختبار**:
  - أنشئ مستخدمين بأدوار مختلفة (admin / owner / user / employee) لاختبار الصلاحيات والـ flows.

#### 2.2 Roles (`Role`)

- `name` في واحدة من: `Owner`, `Tenant`, `Admin`, `Employee`, `User`.
- يتم ملؤها تلقائيًا عند تشغيل السيرفر عن طريق `ensureRoles.service.js`.

#### 2.3 Employees (`Employee`)

- **مطابق لاسكيما SQL**:
  - `userId` (ref User, unique) = CustomerId في SQL.
  - `jobTitle`, `department`, `salary`, `commissionRate (0–100)`, `hireDate`, `employmentType` (`دوام كامل`, `دوام جزئي`, `عقد`), `yearsOfExperience`, `averageRating`, `totalSalesAmount`, `totalDeals`, `isActive`, `createdAt`, `updatedAt`.
- **مثال دوكيومنت للاختبار**:

```json
{
  "userId": "64f123...",
  "jobTitle": "سينيور وكيل عقاري",
  "department": "المبيعات",
  "salary": 8500,
  "commissionRate": 5,
  "hireDate": "2026-03-01T00:00:00.000Z",
  "employmentType": "دوام كامل",
  "yearsOfExperience": 3,
  "averageRating": 4.6,
  "totalSalesAmount": 3000000,
  "totalDeals": 4,
  "isActive": true
}
```

#### 2.4 Properties (`Property`)

- حقول مطابقة تقريبًا لـ `Properties` في SQL:
  - `name`, `description`, `statusSaleRent` (`بيع` | `إيجار`), `availability` (`متاح` | `مباع`), `propertyType`, `area`, `price`, `features`, `category` (`سكني` | `تجاري` | `صناعي`), `ownerId` (ref User), `location{country,city,address,lat,long}`, `details{bedrooms,bathrooms,area,furnished}`, `images[{url,isMain}]`, `isActive`, timestamps.

#### 2.5 Appointments (`Appointment`)

- مماثل لـ `Appointments` في SQL:
  - `propertyId` (ref Property),
  - `customerId` (ref User) + alias `userId` للـ compatibility،
  - `employeeId` (ref Employee),
  - `startTime`, `endTime`, `notes`, `status` (`Scheduled | Completed | Cancelled`), timestamps.

#### 2.6 Transactions / Payments / Installments

- `Transaction`:
  - `propertyId`, `customerId`, `employeeId`, `transactionType` (`بيع` | `إيجار`), `transactionDate`, `totalAmount`, `paidAmount` + virtual `remainingAmount`.
- `PaymentMethod`:
  - `name` (مثل: `نقدي`, `تحويل بنكي`, `فيزا`...).
- `Payment`:
  - `transactionId`, `paymentMethodId`, `amount`, `paymentDate`, `status` (`مدفوع` | `جزئي` | `متأخر`), `notes`.
  - عند إنشاء Payment يتم تحديث `Transaction.paidAmount` (منطق بديل للتريجر).
- `Installment`:
  - `transactionId`, `dueDate`, `amount`, `paidAmount`, `paymentDate`, `status` (`مستحق` | `مدفوع` | `متأخر`), `notes`.

#### 2.7 Favorites / Evaluations / EmailLogs / Tasks

- `Favorite`: `customerId`, `propertyId` (index unique).
- `Evaluation`: `employeeId`, `evaluatorId`, `appointmentId`, `transactionId`, `rating (1–5)`, `comments`, `evaluationDate`.
- `EmailLog`: `userId`, `email`, `subject`, `message`, `status (Sent | Failed)`, `createdAt`.
- `Task`: `employeeId`, `title`, `description`, `status` (`معلق`, `مقبول`, `مرفوض`, `مكتمل`), `dueDate`, timestamps.

---

### 3. توثيق عام لتدفق المشروع

- **تسجيل مستخدم جديد**:
  - `POST /auth/register` → إنشاء User + Role + إرسال كود تفعيل على الإيميل.
  - `POST /auth/verify-code` → تفعيل الإيميل (`isVerified = true`).
- **تسجيل الدخول**:
  - `POST /auth/login` بإيميل أو موبايل → JWT يحتوي على `id` و `role`.
- **إدارة المستخدمين**:
  - الأدمن: `GET /users/byAdmin` لجلب كل المستخدمين.
  - المستخدم: `GET /users` / `/users/me` لجلب بروفايله.
- **تحويل User إلى Employee**:
  - الأدمن ينادي `POST /employees` مع `userId` وباقي حقول الموظف → إنشاء Employee + تحديث Role للمستخدم إلى `Employee`.
- **إدارة العقارات**:
  - الـ Owner/Admin ينشئ عقار بـ `POST /properties`.
  - أي مستخدم يقرأ العقارات بـ `GET /properties` مع فلاتر.
- **حجز مواعيد معاينة**:
  - User يحجز موعد بـ `POST /appointments`.
  - User يشوف مواعيده بـ `GET /appointments/me`.
  - Admin يشوف مواعيد عقار معيّن بـ `GET /appointments/property/:id`.
- **عمليات البيع/الإيجار والمدفوعات**:
  - Employee/Admin ينشئ `Transaction` (بيع/إيجار).
  - عند بيع (`transactionType = بيع`) يتم تحديث `Property.availability = 'مباع'`.
  - عند إضافة `Payment` يتم زيادة `Transaction.paidAmount`، والـ `remainingAmount` تحسب Virtual.
  - يمكن إنشاء خطة أقساط عبر `Installments`.
- **المفضلة والتقييمات**:
  - User/Owner يضيف عقار للمفضلة (`/favorites`) ويشوف مفضلته (`/favorites/me`).
  - User/Owner يقيم موظف بعد موعد أو صفقة (`/evaluations`).

---

### 3. هيكل المشروع (Project Structure)

```text
.
  server.js                # نقطة الدخول، إعداد Express + DB + CORS + logging + error handler
  router.js                # Router رئيسي يربط auth و users

  config/
    db.config.js           # اتصال MongoDB (Mongoose)

  controllers/
    authControllers.js     # منطق الـ auth (register, verify, login, forget/reset password)
    userControllers.js     # منطق الـ users (جلب كل المستخدمين + user الحالي)
    employeeControllers.js
    transactionControllers.js
    paymentMethodControllers.js
    paymentControllers.js
    installmentControllers.js
    favoriteControllers.js
    evaluationControllers.js
    emailLogControllers.js
    taskControllers.js

  middleware/
    auth.middleware.js     # JWT authentication (req.user)
    role.middleware.js     # Role-based authorization
    error-handler.middleware.js  # Global error handler + error logging
    cors.mddleware.js      # CORS مخصص مع ALLOWED_ORIGINS
    paginate.middleware.js # Paginate helper للـ collections
    uploads.middleware.js  # رفع الصور مع قيود الحجم والامتداد

  models/
    userModel.js           # User schema (email, password, roleId, isVerified, codes, isActive)
    Role.model.js          # Role schema (admin/user/...)
    Employee.model.js
    Property.model.js
    Appointment.model.js
    Transaction.model.js
    PaymentMethod.model.js
    Payment.model.js
    Installment.model.js
    Favorite.model.js
    Evaluation.model.js
    EmailLog.model.js
    Task.model.js

  utils/
    sendEmail.js           # وظيفة إرسال الإيميل + قوالب HTML (user + admin)
    logger.util.js         # Winston logger -> logs/error.log, logs/success.log, logs/combined.log
    app-error.util.js      # AppError مخصص
    catch-async.util.js    # Wrapper للـ async controllers

  services/
    autoBackup.service.js  # خدمة النسخ الاحتياطي (إن وُجدت)
    ensureRoles.service.js # Upsert للأدوار الأساسية عند تشغيل السيرفر

  logs/
    error.log              # كل الأخطاء (error)
    success.log            # العمليات الناجحة (info وما فوق)
    combined.log           # كل اللوجز
```

---

### 4. Security & Best Practices

- **JWT Auth**: كل الطلبات المحمية تمر عبر `auth.middleware.js`:
  - تقرأ `Authorization: Bearer <token>`
  - تتحقق من صحة التوكن باستخدام `JWT_SECRET`
  - تجلب المستخدم من DB وتضعه في `req.user` بدون كلمة المرور.
- **Role-based Authorization**: باستخدام `role.middleware.js`:
  - `authorize('admin')` للسماح للأدمن فقط.
  - `authorize('user')` للمستخدم العادي، إلخ.
- **CORS مقيد**: `cors.mddleware.js` يقرأ `ALLOWED_ORIGINS` من `.env` ويرفض أي origin غير مصرح به.
- **Soft Delete**: حقل `isActive` في `userModel.js` يسمح بتعطيل المستخدم بدون حذفه فعليًا.
- **Password Hashing**: يتم تشفير كلمة المرور باستخدام `bcrypt` في hook قبل الحفظ.
- **Email Verification & Reset Codes**:
  - كود تفعيل عند التسجيل (`verificationCode`).
  - كود استرجاع كلمة المرور (`resetCode` + `resetCodeExpires` 10 دقائق).

---

### 5. Logging (Success + Error)

نظام اللوج مبني على **winston** في `utils/logger.util.js`:

- ينشئ تلقائيًا فولدر `logs/` إن لم يكن موجودًا.
- يكتب في:
  - `logs/error.log` : كل الأخطاء (level: error).
  - `logs/success.log` : كل العمليات الناجحة (level: info وما فوق).
  - `logs/combined.log` : جميع الرسائل (debug, info, warn, error).

#### ماذا يتم تسجيله؟

- **على مستوى السيرفر (`server.js`)**:
  - كل طلب: `method`, `originalUrl`, `statusCode`, `duration(ms)`, و `userId` إن وُجد.
- **على مستوى الـ Controllers**:
  - `authControllers`:
    - تسجيل نجاح `register`, `verifyEmail`, `login`, `forgetPassword`, `resetPassword` مع `userId` و `email`.
    - تسجيل محاولات كود تفعيل غير صحيحة.
  - `userControllers`:
    - تسجيل جلب كل المستخدمين بواسطة الأدمن.
    - تسجيل محاولة جلب بروفايل مستخدم غير موجود.
    - تسجيل نجاح جلب بروفايل المستخدم نفسه.
- **Global Error Handler**:
  - أي خطأ يمر على `error-handler.middleware.js` يتم تسجيله بشكل موحد مع:
    - `method`, `url`, `message`, `stack`, `userId`, و `statusCode`.
  - سلوك الاستجابة يعتمد على `NODE_ENV`:
    - في `development`: يرجع stack كامل.
    - في `production`: يرجع رسالة مختصرة للمستخدم، والتفاصيل تبقى في اللوج فقط.

---

### 6. API Reference (Endpoints)

Base URL: `http://localhost:5000/api/v1`

#### Auth (`/auth`)

- **POST `/auth/register`**
  - **الوصف**: إنشاء مستخدم جديد وإرسال كود تفعيل على الإيميل.
  - **Body**:
    - `username` (string, required)
    - `email` (string, required, unique)
    - `password` (string, required)
    - `phoneNumber` (string, optional)
    - `role` (string, one of: `admin`, `user`, `owner`, `employee`) (غير حساسة لحالة الأحرف)
  - **الاستجابة**: `{ message, user }` (بدون كلمة المرور).

- **POST `/auth/verify-code`**
  - **الوصف**: تفعيل الإيميل باستخدام كود التحقق.
  - **Body**:
    - `email` (string, required)
    - `code` (string, required)
  - **الاستجابة**: `{ message: "Email verified successfully" }`

- **POST `/auth/login`**
  - **الوصف**: تسجيل الدخول باستخدام الإيميل أو رقم الهاتف.
  - **Body**:
    - `email` (string, optional)
    - `phoneNumber` (string, optional)
    - `password` (string, required)
  - **الاستجابة**: `{ message: "Login successful.", token }`

- **POST `/auth/forget-password`**
  - **الوصف**: إرسال كود استرجاع كلمة المرور إلى الإيميل.
  - **Body**:
    - `email` (string, required)
  - **الاستجابة**: `{ message: "Reset code sent to email" }`

- **POST `/auth/reset-password`**
  - **الوصف**: إعادة تعيين كلمة المرور باستخدام الكود.
  - **Body**:
    - `email` (string, required)
    - `resetCode` (string, required)
    - `newPassword` (string, required)
  - **الاستجابة**: `{ message: "Password reset successful" }`

#### Users (`/users`)

> كل الـ endpoints هنا تتطلب `Authorization: Bearer <token>`.

- **GET `/users/byAdmin`**
  - **الوصف**: جلب جميع المستخدمين (أدمن فقط).
  - **Middlewares**: `authenticate`, `authorize('admin')`
  - **الاستجابة**: `{ message, data: [users] }`

- **GET `/users`** (أو `/users/me`)
  - **الوصف**: جلب بيانات المستخدم الحالي (صاحب التوكن).
  - **Middlewares**: `authenticate`, `authorize('user', 'admin', 'owner', 'employee')`
  - **الاستجابة**: `{ message, data: user }`

#### Properties (`/properties`)

- **GET `/properties`**
  - **الوصف**: جلب قائمة العقارات مع فلاتر اختيارية (مطابقة للـ schema الجديد).
  - **Query params** (اختياري):
    - `city` (string)
    - `minPrice` (number)
    - `maxPrice` (number)
    - `bedrooms` (number)
    - `statusSaleRent` (string: `بيع` أو `إيجار`)
    - `availability` (string: `متاح` أو `مباع`)
    - `category` (string: `سكني` / `تجاري` / `صناعي`)
    - `page` (number, default `1`)
    - `limit` (number, default `10`)
  - **الاستجابة**: `{ message, data: [properties], pagination }`

- **GET `/properties/:id`**
  - **الوصف**: جلب تفاصيل عقار واحد بالـ ObjectId.
  - **الاستجابة**: `{ message, data: property }`

- **POST `/properties`**
  - **الوصف**: إنشاء عقار جديد (مستخدم مسجل أو Admin).
  - **Middlewares**: `authenticate`, `authorize('admin', 'owner')`
  - **Body**:
    - `name` (string, required)
    - `description` (string, optional)
    - `statusSaleRent` (string, required: `بيع` أو `إيجار`)
    - `availability` (string, optional, default `متاح`)
    - `propertyType` (string, optional)
    - `area` (number, optional)
    - `price` (number, required)
    - `features` (string, optional)
    - `category` (string, optional)
    - `ownerId` (ObjectId string, optional؛ لو مش مرسلة يستخدم `req.user._id`)
    - `details` (object اختياري):
      - `bedrooms` (number)
      - `bathrooms` (number)
      - `area` (number)
      - `furnished` (boolean)
    - `location` (object اختياري):
      - `country` (string)
      - `city` (string)
      - `address` (string)
      - `latitude` (number)
      - `longitude` (number)
    - `images` (array) يدعم:
      - array of strings (URLs) أو
      - array of objects `{ url, isMain }`

- **PATCH `/properties/:id`**
  - **الوصف**: تعديل بيانات عقار.
  - **Middlewares**: `authenticate`, `authorize('admin', 'user')`

- **PATCH `/properties/:id/deactivate`**
  - **الوصف**: تعطيل عقار (soft delete) عبر `isActive = false`.
  - **Middlewares**: `authenticate`, `authorize('admin', 'user')`

#### Appointments (`/appointments`)

> كل الـ endpoints هنا تتطلب `Authorization: Bearer <token>`.

- **POST `/appointments`**
  - **الوصف**: إنشاء موعد جديد لمعاينة عقار.
  - **Middlewares**: `authenticate`, `authorize('user', 'admin')`
  - **Body**:
    - `propertyId` (ObjectId string, required)
    - `startTime` (ISO datetime string, required)
    - `endTime` (ISO datetime string, required)
    - `notes` (string, optional)

- **GET `/appointments/me`**
  - **الوصف**: جلب كل المواعيد الخاصة بالمستخدم الحالي.
  - **Middlewares**: `authenticate`, `authorize('user', 'admin')`

- **GET `/appointments/property/:propertyId`**
  - **الوصف**: جلب كل المواعيد لعقار معيّن (أدمن فقط).
  - **Middlewares**: `authenticate`, `authorize('admin')`

---

### 7. الأمثلة (HTTP Examples)

تم إنشاء ملف منفصل يحتوي على أمثلة جاهزة لكل endpoint:

- `ENDPOINT_EXAMPLES.http`

تقدر تفتحه في VS Code (أو أي REST client) وتجرب الطلبات مباشرة بعد تعديل القيم المناسبة (`email`, `password`, `token`, ...). 

