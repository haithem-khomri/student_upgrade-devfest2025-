import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Access all your AI-powered study tools: chatbot, study recommendations, resources, content generator, and commute mode.',
  openGraph: {
    title: 'Dashboard | Student AI',
    description: 'Access all your AI-powered study tools in one place',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

