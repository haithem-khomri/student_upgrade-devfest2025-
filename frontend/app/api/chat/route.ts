import { NextRequest, NextResponse } from 'next/server';

// Backend API URL - configure this to point to your FastAPI backend
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'http://localhost:8001';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try to call the backend API
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, language: 'ar' }),
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('Backend not available, using fallback response');
    }

    // Fallback response when backend is not available
    const fallbackResponses: Record<string, string> = {
      'كيف أستعد للامتحانات؟': `إليك بعض النصائح للاستعداد للامتحانات:

1. **ابدأ مبكراً** - لا تنتظر حتى آخر لحظة
2. **نظم وقتك** - اصنع جدول دراسي واضح
3. **راجع بانتظام** - المراجعة المتكررة تثبت المعلومات
4. **استخدم البطاقات التعليمية** - مفيدة للحفظ السريع
5. **خذ فترات راحة** - الدماغ يحتاج للاستراحة
6. **نم جيداً** - النوم الكافي ضروري للتركيز`,

      'نصائح للتركيز أثناء الدراسة': `إليك نصائح لتحسين تركيزك:

1. **اختر مكان هادئ** - ابتعد عن المشتتات
2. **أطفئ الإشعارات** - الهاتف أكبر عدو للتركيز
3. **استخدم تقنية Pomodoro** - 25 دقيقة دراسة ثم 5 دقائق راحة
4. **رتب مكان دراستك** - المكان المرتب يساعد على التركيز
5. **اشرب ماء** - الجفاف يؤثر على التركيز
6. **حدد أهداف صغيرة** - إنجاز الأهداف الصغيرة يحفزك`,

      'كيف أنظم وقتي؟': `إليك خطوات لتنظيم وقتك:

1. **اكتب كل مهامك** - استخدم تطبيق أو دفتر
2. **حدد الأولويات** - ما هو المهم والعاجل؟
3. **اصنع جدول أسبوعي** - وزع المهام على الأيام
4. **خصص وقت للدراسة يومياً** - الاستمرارية مهمة
5. **لا تنسَ الراحة** - خصص وقت للترفيه
6. **راجع جدولك** - عدّل حسب الحاجة`,
    };

    // Check if we have a predefined response
    const lowerMessage = message.trim();
    let responseMessage = fallbackResponses[lowerMessage];

    if (!responseMessage) {
      // Generic response for other questions
      responseMessage = `شكراً على سؤالك! 

أنا المساعد الذكي للطلاب. للحصول على إجابات مخصصة ومفصلة، يرجى تسجيل الدخول للوصول إلى الميزات الكاملة.

في الوقت الحالي، يمكنني مساعدتك في:
- نصائح للدراسة والامتحانات
- تنظيم الوقت
- تحسين التركيز

سجل الآن للحصول على توصيات مخصصة!`;
    }

    const response = NextResponse.json({ message: responseMessage });
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Chat API error:', error);
    const errorResponse = NextResponse.json(
      { message: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return errorResponse;
  }
}

