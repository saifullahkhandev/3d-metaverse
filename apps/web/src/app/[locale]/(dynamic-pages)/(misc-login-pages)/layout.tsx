export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full bg-linear-to-br from-[#8BC6EC] to-[#9599E2] dark:bg-gray-900/20 dark:bg-none">
      <div className="grid">
        <div className="flex h-screen flex-col items-center justify-center space-y-8 text-center">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
