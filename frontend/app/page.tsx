import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Brain,
  BookOpen,
  FileText,
  Sparkles,
  ArrowLeft,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import QuickChat from "./components/QuickChat";

export const metadata: Metadata = {
  title: "Student AI - منصة الإنتاجية الدراسية بالذكاء الاصطناعي",
  description:
    "ادرس بذكاء مع أدوات الذكاء الاصطناعي. احصل على توصيات دراسية مخصصة، وأنشئ بطاقات تعليمية، وتحدث مع مساعد ذكي مصمم لطلاب الجامعات.",
};

export default function LandingPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "المساعد الذكي",
      description:
        "احصل على إجابات فورية لأسئلة الجامعة مع مساعد AI يفهم السياق",
    },
    {
      icon: Brain,
      title: "محرك قرارات الدراسة",
      description:
        "توصيات مدعومة بالذكاء الاصطناعي حول ما يجب دراسته بناءً على مزاجك وطاقتك",
    },
    {
      icon: BookOpen,
      title: "توصيات الموارد",
      description: "موارد تعليمية مخصصة تتكيف مع تفضيلاتك وتقييماتك",
    },
    {
      icon: FileText,
      title: "مولد المحتوى",
      description:
        "أنشئ ملخصات، بطاقات تعليمية، اختبارات، وأسئلة امتحان من موادك",
    },
  ];

  const stats = [
    { value: "10K+", label: "طالب نشط" },
    { value: "50K+", label: "ساعة دراسة محفوظة" },
    { value: "1M+", label: "استجابة AI" },
  ];

  const benefits = [
    "وفر الوقت مع توصيات دراسية ذكية",
    "اوصل لموارد تعليمية مخصصة",
    "أنشئ مواد دراسية فوراً",
    "ادرس بكفاءة حسب مستوى طاقتك",
    "احصل على إجابات لأسئلة الجامعة 24/7",
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-40" />
      <div className="fixed inset-0 hero-glow" />

      {/* Floating Orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-[#4b58ff]/10 rounded-full blur-[150px] animate-pulse-slow" />
      <div
        className="fixed bottom-20 right-10 w-[500px] h-[500px] bg-[#4b58ff]/8 rounded-full blur-[180px] animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1]/5 rounded-full blur-[200px] animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="group relative flex items-center">
              <div className="relative">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="object-contain w-40 h-40 brightness-110 drop-shadow-xl group-hover:scale-110 transition-all duration-300 filter group-hover:brightness-125"
                  priority
                />
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-muted hover:text-white transition-colors font-semibold"
              >
                الميزات
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-muted hover:text-white transition-colors font-semibold"
              >
                كيف يعمل
              </a>
              <a
                href="#benefits"
                className="text-sm text-muted hover:text-white transition-colors font-semibold"
              >
                المميزات
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm text-muted hover:text-white transition-colors hidden sm:block font-semibold"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/login"
                className="btn btn-primary text-sm px-5 py-2.5 flex items-center gap-2 font-semibold relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10">ابدأ الآن</span>
                <ArrowLeft size={16} className="relative z-10" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-24 lg:pb-32">
        <div className="container-desktop">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Badge */}
            <div className="badge mx-auto animate-slideDown relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4b58ff]/20 to-transparent animate-shimmer" />
              <Sparkles size={16} className="relative z-10" />
              <span className="relative z-10">
                منصة إنتاجية الطلاب بالذكاء الاصطناعي
              </span>
            </div>

            {/* Logo in Hero */}
            <div
              className="flex justify-center mb-8 animate-slideUp"
              style={{ animationDelay: "0.05s" }}
            >
              <div className="relative group">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={180}
                  height={180}
                  className="object-contain w-40 h-40 lg:w-48 lg:h-48 brightness-110 drop-shadow-2xl group-hover:scale-110 transition-all duration-500 filter group-hover:brightness-125"
                  priority
                />
              </div>
            </div>

            {/* Main Heading */}
            <h1
              className="text-5xl lg:text-7xl font-bold mb-6 animate-slideUp"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="text-white">ادرس بذكاء،</span>
              <br />
              <span className="brand-text bg-gradient-to-r from-[#4b58ff] via-[#6366f1] to-[#818cf8] bg-clip-text text-transparent animate-gradient">
                وليس بجهد أكبر
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="text-xl lg:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed animate-slideUp font-light"
              style={{ animationDelay: "0.2s" }}
            >
              احصل على توصيات دراسية مخصصة، أنشئ مواد تعليمية، وتعامل مع أدوات
              AI مصممة لمساعدة طلاب الجامعات على التفوق.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6 animate-slideUp"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                href="/auth/login"
                className="btn btn-primary text-lg px-10 py-4 flex items-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10">ابدأ مجاناً</span>
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform relative z-10"
                />
              </Link>
              <a
                href="#features"
                className="btn btn-secondary text-lg px-10 py-4"
              >
                استكشف الميزات
              </a>
            </div>

            {/* Stats */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 mt-10 border-t border-white/10 animate-slideUp"
              style={{ animationDelay: "0.4s" }}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-28 lg:py-36">
        <div className="container-desktop">
          <div className="text-center mb-20">
            <div className="badge mx-auto mb-8">
              <Zap size={16} />
              <span>ميزات قوية</span>
            </div>
            <h2 className="text-white mb-6">كل ما تحتاجه للنجاح</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto font-light">
              أدوات AI قوية مصممة خصيصاً لطلاب الجامعات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card-glow group cursor-pointer relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4b58ff]/0 via-[#4b58ff]/0 to-[#4b58ff]/0 group-hover:via-[#4b58ff]/5 group-hover:to-[#4b58ff]/10 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="feature-icon mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Icon className="text-white" size={26} />
                    </div>
                    <h3 className="text-white mb-4 group-hover:text-[#4b58ff] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted leading-relaxed font-light group-hover:text-text-secondary transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-28 lg:py-36">
        <div className="container-desktop">
          <div className="text-center mb-20">
            <div className="badge mx-auto mb-8">
              <Clock size={16} />
              <span>سهل وسريع</span>
            </div>
            <h2 className="text-white mb-6">كيف يعمل</h2>
            <p className="text-xl text-muted max-w-2xl mx-auto font-light">
              ابدأ في دقائق وغير روتينك الدراسي
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "سجل حساباً",
                desc: "أنشئ حسابك المجاني في ثوانٍ. لا حاجة لبطاقة ائتمان.",
              },
              {
                step: "02",
                title: "حدد تفضيلاتك",
                desc: "أخبرنا عن موادك، جدولك، وأهدافك الدراسية.",
              },
              {
                step: "03",
                title: "ابدأ الدراسة بذكاء",
                desc: "احصل على توصيات AI وأدوات لتعزيز إنتاجيتك.",
              },
            ].map((item, index) => (
              <div key={item.step} className="text-center relative group">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
                )}

                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#4b58ff] via-[#6366f1] to-[#818cf8] flex items-center justify-center glow group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer" />
                    <span className="text-3xl font-bold text-white relative z-10">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-white mb-4 group-hover:text-[#4b58ff] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted leading-relaxed font-light group-hover:text-text-secondary transition-colors">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative py-28 lg:py-36">
        <div className="container-desktop">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div>
                <div className="badge mb-8">
                  <Shield size={16} />
                  <span>لماذا تختارنا</span>
                </div>
                <h2 className="text-white mb-6">لماذا Student AI؟</h2>
                <p className="text-xl text-muted mb-12 leading-relaxed font-light">
                  انضم لآلاف الطلاب الذين يدرسون بذكاء ويحققون نتائج أفضل
                </p>

                <div className="space-y-5">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-5 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#4b58ff]/30 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#4b58ff]/10 flex items-center justify-center group-hover:bg-[#4b58ff]/20 transition-colors shrink-0">
                        <CheckCircle className="text-[#4b58ff]" size={22} />
                      </div>
                      <p className="text-white font-medium">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="card-glass p-10 lg:p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4b58ff]/5 via-transparent to-transparent" />
                  <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="relative group">
                        <Image
                          src="/icon.png"
                          alt="Student AI"
                          width={56}
                          height={56}
                          className="object-contain w-14 h-14 brightness-110 drop-shadow-lg group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">
                          ذكاء اصطناعي متقدم
                        </h4>
                        <p className="text-muted font-light">
                          مدعوم بأحدث تقنيات AI
                        </p>
                      </div>
                    </div>

                    <div className="divider" />

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted font-medium">
                            دقة التوصيات
                          </span>
                          <span className="text-[#4b58ff] font-bold">95%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[95%] bg-[#4b58ff] rounded-full" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted font-medium">
                            رضا المستخدمين
                          </span>
                          <span className="text-[#4b58ff] font-bold">98%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[98%] bg-[#4b58ff] rounded-full" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted font-medium">
                            تحسن الأداء
                          </span>
                          <span className="text-[#4b58ff] font-bold">87%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[87%] bg-[#4b58ff] rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#4b58ff]/15 rounded-full blur-3xl animate-pulse-slow" />
                <div
                  className="absolute -bottom-6 -left-6 w-40 h-40 bg-[#4b58ff]/10 rounded-full blur-3xl animate-pulse-slow"
                  style={{ animationDelay: "1s" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 lg:py-36">
        <div className="container-desktop">
          <div className="max-w-4xl mx-auto">
            <div className="card-glass relative overflow-hidden p-12 lg:p-20 text-center">
              <div className="absolute inset-0 bg-[#4b58ff]/5" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#4b58ff]/15 rounded-full blur-[150px]" />

              <div className="relative z-10">
                <h2 className="text-white mb-8">مستعد لتغيير طريقة دراستك؟</h2>
                <p className="text-xl text-muted mb-12 max-w-2xl mx-auto font-light">
                  انضم لآلاف الطلاب الذين يستخدمون AI للدراسة بذكاء وتحقيق نتائج
                  أفضل.
                </p>
                <Link
                  href="/auth/login"
                  className="btn btn-primary text-lg px-12 py-5 inline-flex items-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative z-10">ابدأ مجاناً الآن</span>
                  <ArrowLeft
                    size={20}
                    className="group-hover:-translate-x-1 transition-transform relative z-10"
                  />
                </Link>
                <p className="text-sm text-muted mt-8 font-light">
                  لا حاجة لبطاقة ائتمان • مجاني للأبد
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain w-12 h-12 brightness-110 drop-shadow-lg group-hover:scale-110 transition-all duration-300 filter group-hover:brightness-125"
                />
              </div>
            </Link>

            <div className="flex items-center gap-8 text-sm text-muted font-semibold">
              <a
                href="#features"
                className="hover:text-white transition-colors"
              >
                الميزات
              </a>
              <a
                href="#how-it-works"
                className="hover:text-white transition-colors"
              >
                كيف يعمل
              </a>
              <a
                href="#benefits"
                className="hover:text-white transition-colors"
              >
                المميزات
              </a>
              <Link
                href="/auth/login"
                className="hover:text-white transition-colors"
              >
                تسجيل الدخول
              </Link>
            </div>

            <div className="text-sm text-muted font-medium">
              © 2025 Student AI. جميع الحقوق محفوظة.
            </div>
          </div>
        </div>
      </footer>

      {/* Quick Chat Widget */}
      <QuickChat />
    </div>
  );
}
