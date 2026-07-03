export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-2 flex items-center justify-center px-4 py-10">
      {children}
    </main>
  );
}
