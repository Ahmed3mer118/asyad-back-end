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
- **تسجيل الدخول**:
- **إدارة المستخدمين**
- **تحويل User إلى Employee**:
- **إدارة العقارات**:
- **حجز مواعيد معاينة**:
- **عمليات البيع/الإيجار والمدفوعات**:
- **المفضلة والتقييمات**:

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


### 7. الأمثلة (HTTP Examples)

تم إنشاء ملف منفصل يحتوي على أمثلة جاهزة لكل endpoint:

- `ENDPOINT_EXAMPLES.http`



