import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './layout.css';
import { Providers } from './providers';
import { viewport } from './viewport';

const beVietnamPro = Be_Vietnam_Pro({ 
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export { viewport };

export const metadata: Metadata = {
  title: {
    default: 'Student AI - منصة الإنتاجية الدراسية المدعومة بالذكاء الاصطناعي',
    template: '%s | Student AI',
  },
  description: 'أدوات إنتاجية مدعومة بالذكاء الاصطناعي لطلاب الجامعات. احصل على توصيات الدراسة، أنشئ البطاقات التعليمية، واطلع على الموارد المخصصة وتحدث مع مساعد ذكي.',
  keywords: [
    'student productivity',
    'AI study assistant',
    'university tools',
    'study planner',
    'flashcard generator',
    'academic resources',
    'student chatbot',
    'study recommendations',
  ],
  authors: [{ name: 'Student AI Platform' }],
  creator: 'Student AI Platform',
  publisher: 'Student AI Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: '/',
    siteName: 'Student AI - منصة الإنتاجية الدراسية',
    title: 'Student AI - منصة الإنتاجية الدراسية المدعومة بالذكاء الاصطناعي',
    description: 'أدوات إنتاجية مدعومة بالذكاء الاصطناعي لطلاب الجامعات. احصل على توصيات الدراسة، أنشئ البطاقات التعليمية، واطلع على الموارد المخصصة.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Student Productivity Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Student Productivity Platform',
    description: 'AI-powered productivity tools for university students',
    images: ['/og-image.png'],
    creator: '@studentaiapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', type: 'image/png' },
    ],
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Edge/IE Compatibility */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Prevent caching in development */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
            <meta httpEquiv="Pragma" content="no-cache" />
            <meta httpEquiv="Expires" content="0" />
          </>
        )}
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Student AI - منصة الإنتاجية الدراسية',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web',
              description: 'أدوات إنتاجية مدعومة بالذكاء الاصطناعي لطلاب الجامعات',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Student AI - منصة الإنتاجية الدراسية',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/icon-512.png`,
            }),
          }}
        />
      </head>
      <body className={beVietnamPro.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
