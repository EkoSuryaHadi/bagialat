import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-emerald-100 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-600/30">
          ⚡
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900">TebarAlat</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Platform katalog sewa alat instan dengan indikator status *real-time* khusus untuk grup WhatsApp.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link 
            href="/dashboard"
            className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            Masuk / Buat Katalog Saya 🚀
          </Link>
          <p className="text-xs text-gray-400">
            Gratis selamanya • Tanpa instal aplikasi
          </p>
        </div>
      </div>
    </main>
  );
}
