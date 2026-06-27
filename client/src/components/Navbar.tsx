import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/orders" className="text-lg font-semibold text-slate-900">
          Order Manager
        </Link>
        <nav className="flex gap-4 text-sm font-medium text-slate-600">
          <Link href="/orders" className="hover:text-brand-600">
            Orders
          </Link>
          <Link href="/orders/new" className="hover:text-brand-600">
            New Order
          </Link>
          <Link href="/analytics" className="hover:text-brand-600">
            Analytics
          </Link>
        </nav>
      </div>
    </header>
  );
}
