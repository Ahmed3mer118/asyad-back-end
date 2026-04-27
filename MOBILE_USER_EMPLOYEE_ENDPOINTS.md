# Mobile API Handover (User + Employee)

Base URL:
- `http://localhost:5000/api/v1`

Auth:
- استخدم `Authorization: Bearer <TOKEN>` في أي endpoint مكتوب عليه Protected.
- الـ token بيرجع من `POST /auth/login`.
- الأدوار المتاحة: `user`, `admin`, `owner`, `employee`.

---

## 1) Authentication (User app + Employee app)

### `POST /auth/register`
- **Access:** Public
- **Body (required):**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string",
  "role": "user | owner | employee | admin"
}
```
- **Success:** `201` + `message` + `user`
- **Notes:** لازم تعمل Verify Email قبل login.

### `POST /auth/verify-code`
- **Access:** Public
- **Body (required):**
```json
{
  "email": "string",
  "code": "6-digit string"
}
```
- **Success:** `200`

### `POST /auth/login`
- **Access:** Public
- **Body (required):** إما `email` أو `phoneNumber` + `password`
```json
{
  "email": "string",
  "password": "string"
}
```
- **Success:** `200` + `token`

### `POST /auth/forget-password`
- **Access:** Public
- **Body (required):**
```json
{
  "email": "string"
}
```
- **Success:** `200`

### `POST /auth/reset-password`
- **Access:** Public
- **Body (required):**
```json
{
  "email": "string",
  "resetCode": "6-digit string",
  "newPassword": "string"
}
```
- **Success:** `200`

---

## 2) User Profile Endpoints (Mobile User)

### `GET /users/me`
- **Access:** Protected (`user`, `admin`, `owner`, `employee`)
- **Success:** `200` + user profile

### `GET /users/`
- **Access:** Protected (`user`, `admin`, `owner`, `employee`)
- **Behavior:** بيرجع نفس نتيجة `/users/me` (current logged-in user)

### `PUT /users/me`
- **Access:** Protected (`user`, `admin`)
- **Body (optional fields):**
```json
{
  "userName": "string",
  "phone_number": "string",
  "address": "string"
}
```
- **Success:** `200` + updated user

---

## 3) Property Browsing (User Mobile)

### `GET /properties`
- **Access:** Public
- **Query (optional):**
  - `city`
  - `minPrice`
  - `maxPrice`
  - `bedrooms`
  - `statusSaleRent`
  - `availability`
  - `category`
  - `page` (default 1)
  - `limit` (default 10)
- **Success:** `200` + `data` + `pagination`

### `GET /properties/:id`
- **Access:** Public
- **Success:** `200` + property data

### `GET /properties/slug/:slug`
- **Access:** Public
- **Success:** `200` + property data

---

## 4) Favorites (User Mobile)

### `POST /favorites`
- **Access:** Protected (`user`, `owner`)
- **Body (required):**
```json
{
  "propertyId": "ObjectId"
}
```
- **Success:** `201` (or `200` if already favorite)

### `GET /favorites/me`
- **Access:** Protected (`user`, `owner`)
- **Success:** `200` + list of user favorites

### `DELETE /favorites/:propertyId`
- **Access:** Protected (`user`, `owner`)
- **Success:** `204`

### `GET /favorites/popular`
- **Access:** Public
- **Query (optional):** `city`, `limit`
- **Success:** `200` + popular properties by favorites

---

## 5) Appointments (User Mobile)

### `POST /appointments/book`
- **Access:** Protected (`user`, `admin`)
- **Body (required):**
```json
{
  "propertyId": "ObjectId",
  "startTime": "ISO date",
  "endTime": "ISO date",
  "notes": "string"
}
```
- **Success:** `201`

### `GET /appointments/me`
- **Access:** Protected (`user`, `admin`)
- **Success:** `200` + user appointments

### `GET /appointments/:id`
- **Access:** Protected (`admin`, `user`)
- **Success:** `200` + single appointment

---

## 6) Transactions, Payments, Installments (User Mobile)

## Transactions

### `GET /transactions/me`
- **Access:** Protected (`user`)
- **Query (optional):** `page`, `limit`
- **Success:** `200` + `data`, `total`

## Payments

### `POST /payments`
- **Access:** Protected (أي مستخدم مسجل)
- **User rule:** يقدر يدفع فقط على transaction تخصه.
- **Body (required):**
```json
{
  "transactionId": "ObjectId",
  "paymentMethod": "cash | card | ...",
  "amount": 1000
}
```
- **Body (optional):**
```json
{
  "installmentId": "ObjectId",
  "status": "pending | paid | failed",
  "notes": "string"
}
```
- **Success:** `201` + payment + updated transaction

### `GET /payments/me`
- **Access:** Protected
- **Success:** `200` + user payments

### `GET /payments`
- **Access:** Protected
- **Query (optional):** `transactionId`
- **User rule:** يقدر يشوف payments الخاصة بمعاملاته فقط.

## Installments

### `GET /installments/me`
- **Access:** Protected
- **Query (optional):** `page`, `limit`
- **Success:** `200` + user installments

### `GET /installments`
- **Access:** Protected
- **Query (optional):** `transactionId`, `page`, `limit`
- **User rule:** لو transactionId موجود، لازم يكون transaction تبع نفس المستخدم.

---

## 7) Employee App Endpoints

### `GET /evaluations?employeeId=<id>`
- **Access:** Protected (`admin`, `employee`)
- **Use case:** الموظف يعرض التقييمات الخاصة به.

### `GET /tasks-to-employees?employeeId=<id>&status=<status>`
- **Access:** Protected (`admin`, `employee`)
- **Use case:** الموظف يعرض المهام المسندة له من الإدارة.

### `PATCH /tasks-to-employees/:id`
- **Access:** Protected (`admin`, `employee`)
- **Body:** أي حقول update (عادة status, notes, dueDate...)
- **Use case:** الموظف يحدّث حالة المهمة.

### `POST /tasks-by-employees`
- **Access:** Protected (`admin`, `employee`)
- **Body (required):**
```json
{
  "employeeId": "ObjectId",
  "taskNo": 1,
  "data": "string"
}
```
- **Body (optional):**
```json
{
  "notes": "string"
}
```
- **Use case:** الموظف يرسل task report/تحديث للتنفيذ.

### `GET /tasks-by-employees?employeeId=<id>&status=<status>`
- **Access:** Protected (`admin`, `employee`)
- **Use case:** عرض ما تم إرساله بواسطة الموظف.

### `PATCH /tasks-by-employees/:id`
- **Access:** Protected (`admin`, `employee`)
- **Use case:** تعديل report/task submitted.

---

## 8) Evaluation Submission (User rates Employee)

### `POST /evaluations`
- **Access:** Protected (`user`, `owner`, `admin`)
- **Body (required):**
```json
{
  "employeeId": "ObjectId",
  "rating": 1
}
```
- **Body (optional):**
```json
{
  "appointmentId": "ObjectId",
  "transactionId": "ObjectId",
  "comments": "string"
}
```
- **Success:** `201`

---

## 9) Endpoints Not Needed For Mobile User/Employee UI (Usually Admin Panel)

- `GET /users/byAdmin`
- `PUT /users/update-status`
- `GET /users/:id`
- `PATCH /users/:id` (update role)
- `POST /employees`
- `GET /employees`
- `GET /employees/:id`
- `PATCH /employees/:id`
- `PATCH /employees/:id/deactivate`
- `POST /appointments` (admin create)
- `GET /appointments` (admin list all)
- `GET /appointments/property/:propertyId`
- `PUT /appointments/:id/status`
- `POST /transactions` (admin/employee create)
- `GET /transactions` (admin/employee list)
- `GET /transactions/:id`
- `PATCH /transactions/:id`
- `POST /installments`
- `POST /installments/generate`
- `PATCH /installments/:id`
- `GET /favorites/long-standing`
- `GET /favorites/favorited-by/:propertyId`
- `GET /favorites/stats/:propertyId`

---

## 10) Quick Integration Checklist for Mobile Developer

- خلص Auth flow: register -> verify-code -> login -> store token.
- اعتمد على `/users/me` لبيانات البروفايل الأساسية.
- لواجهة العقارات استخدم `/properties` مع pagination + filters.
- نفّذ Favorites (add/list/remove) على نفس property card.
- احجز معاينة من `/appointments/book` واعرضها من `/appointments/me`.
- لصفحة المدفوعات والأقساط استخدم:
  - `/transactions/me`
  - `/payments/me`
  - `/installments/me`
- لتطبيق الموظف نفّذ:
  - `/tasks-to-employees`
  - `/tasks-by-employees`
  - `/evaluations`

