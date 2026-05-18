export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0e14] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-white">PURA VIDA </span>
            <span className="text-[#d4a843]">VENTURES</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
