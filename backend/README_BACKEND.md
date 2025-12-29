# Backend Server - دليل التشغيل

## المتطلبات

1. **Python 3.9+** - تأكد من تثبيت Python
2. **pip** - مدير الحزم لـ Python

## خطوات التشغيل

### 1. تثبيت المتطلبات

افتح Terminal في مجلد `backend` وقم بتشغيل:

```bash
pip install -r requirements.txt
```

### 2. تشغيل السيرفر

#### الطريقة الأولى: استخدام PowerShell Script (موصى بها)

في PowerShell، من مجلد `backend`:

```powershell
.\start_server.ps1
```

#### الطريقة الثانية: تشغيل يدوي

في Terminal (PowerShell أو CMD):

```powershell
# الانتقال إلى مجلد backend
cd backend

# تعيين متغيرات البيئة (استبدل بالقيم الخاصة بك)
$env:MONGODB_URL = "mongodb+srv://username:password@cluster.mongodb.net/student_ai?retryWrites=true&w=majority"
$env:MONGODB_DB_NAME = "student_ai"
$env:LLM_PROVIDER = "google"
$env:GOOGLE_API_KEY = "your-google-api-key-here"
$env:SECRET_KEY = "your-secret-key-here"

# تشغيل السيرفر
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

#### الطريقة الثالثة: استخدام .env file (موصى بها)

أنشئ ملف `.env` في مجلد `backend` (انظر `.env.example` للقالب):

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/student_ai?retryWrites=true&w=majority
MONGODB_DB_NAME=student_ai
LLM_PROVIDER=google
GOOGLE_API_KEY=your-google-api-key-here
SECRET_KEY=your-secret-key-change-in-production
```

ثم شغل:

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

## التحقق من التشغيل

بعد تشغيل السيرفر، افتح المتصفح واذهب إلى:

- **API Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health
- **API Root**: http://localhost:8001/

## المنافذ (Ports)

- **Backend**: `8001`
- **Frontend**: `3000` (افتراضي)

## إيقاف السيرفر

اضغط `Ctrl + C` في Terminal لإيقاف السيرفر.

## استكشاف الأخطاء

### خطأ: Port 8001 مستخدم

```powershell
# ابحث عن العملية التي تستخدم المنفذ
netstat -ano | findstr :8001

# أوقف العملية (استبدل PID برقم العملية)
taskkill /PID <PID> /F
```

### خطأ: MongoDB connection failed

- تأكد من أن متغير `MONGODB_URL` صحيح
- تأكد من اتصال الإنترنت
- تحقق من أن MongoDB Atlas يسمح بالاتصالات من IP الخاص بك

### خطأ: Module not found

```bash
pip install -r requirements.txt
```

### خطأ: Google API quota exceeded

إذا ظهرت رسالة "Quota exceeded"، انتظر حتى يتم تجديد الحصة المجانية أو قم بتفعيل الفوترة في Google Cloud Console.

## API Endpoints الرئيسية

- `POST /api/chat` - Chat API
- `GET /api/management/modules` - قائمة المواد
- `POST /api/management/modules` - إضافة مادة جديدة
- `GET /api/recommendations/...` - نظام التوصيات
- `GET /docs` - Swagger UI Documentation

