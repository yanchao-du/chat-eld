import Link from 'next/link';

export default function ELDHeader() {
  return (
    <header className="bg-eldRed text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl tracking-wide">
          <Link href="/">Elections Department Singapore</Link>
        </div>
        <nav className="flex gap-6">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/voters" className="hover:underline">Voters</Link>
          <Link href="#" className="hover:underline">Candidates</Link>
          <Link href="/faq" className="hover:underline">FAQs</Link>
        </nav>
      </div>
    </header>
  );
}
