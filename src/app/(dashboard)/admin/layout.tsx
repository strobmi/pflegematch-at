export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-[#1E1E1E] p-6 lg:p-8">
      {children}
    </div>
  );
}
