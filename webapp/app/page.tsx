import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Singapore General Election 2025</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get answers to your election questions and stay informed about the upcoming voting procedures.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <Link href="/voters" className="block p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow bg-gray-50 hover:bg-white group">
          <h2 className="text-2xl font-semibold mb-3 text-eldRed group-hover:text-red-800">Check Voter Registration &rarr;</h2>
          <p className="text-gray-600">Verify your eligibility, check your registered address, and view your voter status for the upcoming election.</p>
        </Link>

        <Link href="/faq" className="block p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow bg-gray-50 hover:bg-white group">
          <h2 className="text-2xl font-semibold mb-3 text-eldRed group-hover:text-red-800">Find Your Polling Station &rarr;</h2>
          <p className="text-gray-600">Locate your designated polling station, check opening hours, and learn what you need to bring on Polling Day.</p>
        </Link>

        <Link href="/faq" className="block p-8 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow bg-gray-50 hover:bg-white group">
          <h2 className="text-2xl font-semibold mb-3 text-eldRed group-hover:text-red-800">How to Vote &rarr;</h2>
          <p className="text-gray-600">Understand the step-by-step process of casting your vote, from receiving your poll card to dropping your ballot.</p>
        </Link>
      </div>
    </div>
  );
}
