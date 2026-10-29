'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [supabase] = useState(() => createClientComponentClient());
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  
  // State Form Toko Baru (Onboarding)
  const [shopName, setShopName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [isCreatingShop, setIsCreatingShop] = useState(false);

  // State Form Tambah Alat
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Umum');

  useEffect(() => {
    fetchUserData();
  }, []);

  async const fetchUserData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Ambil data toko milik user
    const { data: shopData } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (shopData) {
      setShop(shopData);
      fetchItems(shopData.id);
    } else {
      setIsCreatingShop(true); // Belum punya toko, tampilkan onboarding
    }
    setLoading(false);
  }

  async const fetchItems(shopId: string) {
    const { data } = await supabase
      .from('rental_items')
      .select('*')
      .eq('shop_id', shopId)
      .order('sort_order', { ascending: true });
    if (data) setItems(data);
  }

  // Handle Pembuatan Toko Baru (Onboarding 30 Detik)
  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate slug otomatis dari nama toko (contoh: "Borneo Outdoor" -> "borneo-outdoor")
    const slug = shopName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const { data, error } = await supabase
      .from('shops')
      .insert([
        {
          owner_id: user.id,
          name: shopName,
          slug: `${slug}-${Math.floor(Math.random() * 1000)}`, // Unik
          whatsapp: whatsapp,
          address: address,
        }
      ])
      .select()
      .single();

    if (error) {
      alert('Gagal membuat toko: ' + error.message);
    } else if (data) {
      setShop(data);
      setIsCreatingShop(false);
      fetchItems(data.id);
      
      // Masukkan 1 alat contoh otomatis agar katalog tidak kosong
      await supabase.from('rental_items').insert([
        { shop_id: data.id, name: 'Contoh: Tenda Camping 4P', price_per_day: 50000, status: 'available' }
      ]);
      fetchItems(data.id);
    }
  };

  // Handle 1-Tap Toggle Status Alat
  const handleStatusChange = async (itemId: string, newStatus: string) => {
    // Optimistic UI update di lokal dulu agar terasa instan
    setItems(items.map(i => i.id === itemId ? { ...i, status: newStatus } : i));

    await supabase
      .from('rental_items')
      .update({ status: newStatus, updated_at: new Date() })
      .eq('id', itemId);
  };

  // Handle Tambah Alat Baru
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    const { error } = await supabase.from('rental_items').insert([
      {
        shop_id: shop.id,
        name: newItemName,
        price_per_day: parseInt(newItemPrice) || 0,
        category: newItemCategory,
        status: 'available',
      }
    ]);

    if (error) {
      alert('Gagal menambah alat: ' + error.message);
    } else {
      setNewItemName('');
      setNewItemPrice('');
      setShowAddModal(false);
      fetchItems(shop.id);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat dashboard...</div>;

  // TAMPILAN ONBOARDING (Jika belum punya toko)
  if (isCreatingShop || !shop) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">⚡ Siapkan Katalog Rentalmu</h2>
        <p className="text-sm text-gray-500 mb-6">Hanya butuh 30 detik untuk membuat link katalog siap sebar ke WhatsApp.</p>
        
        <form onSubmit={handleCreateShop} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Usaha / Rental</label>
            <input 
              type="text" required placeholder="Contoh: Borneo Outdoor Balikpapan"
              value={shopName} onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor WhatsApp Admin (Format: 628...)</label>
            <input 
              type="text" required placeholder="6281234567890"
              value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Lokasi / Alamat Singkat</label>
            <input 
              type="text" required placeholder="Jl. MT Haryono, Balikpapan"
              value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition">
            Buat Katalog Sekarang 🚀
          </button>
        </form>
      </div>
    );
  }

  // TAMPILAN DASHBOARD UTAMA (1-Tap Toggle)
  return (
    <div className="max-w-xl mx-auto min-h-screen bg-gray-50 pb-12">
      {/* Header Info */}
      <div className="bg-white p-4 border-b sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-bold text-lg text-gray-800">{shop.name}</h1>
          <a 
            href={`/${shop.slug}`} target="_blank" rel="noopener noreferrer"
            className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium hover:bg-emerald-100 transition"
          >
            Lihat Katalog Publik ↗
          </a>
        </div>
        <p className="text-xs text-gray-400">Link: tebaralat.id/{shop.slug}</p>
      </div>

      {/* Konten Utama */}
      <div className="p-4 space-y-4">
        {/* Tombol Tambah Alat */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-sm text-gray-700">Daftar Inventaris ({items.length} Alat)</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow hover:bg-emerald-700 transition"
          >
            + Tambah Alat Baru
          </button>
        </div>

        {/* List Alat dengan 1-Tap Toggle */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                  <p className="text-xs text-emerald-600 font-medium">Rp {item.price_per_day.toLocaleString('id-ID')} / hari</p>
                </div>
              </div>

              {/* Tombol 1-Tap Status Switch */}
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium text-center">
                <button 
                  onClick={() => handleStatusChange(item.id, 'available')}
                  className={`py-1.5 rounded-lg transition ${item.status === 'available' ? 'bg-emerald-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  🟢 Ready
                </button>
                <button 
                  onClick={() => handleStatusChange(item.id, 'rented')}
                  className={`py-1.5 rounded-lg transition ${item.status === 'rented' ? 'bg-rose-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  🔴 Disewa
                </button>
                <button 
                  onClick={() => handleStatusChange(item.id, 'maintenance')}
                  className={`py-1.5 rounded-lg transition ${item.status === 'maintenance' ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  🟡 Servis
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tambah Alat */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-gray-800">Tambah Alat Baru</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Alat</label>
                <input 
                  type="text" required placeholder="Contoh: Genset 2000W"
                  value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Harga Sewa Per Hari (Rp)</label>
                <input 
                  type="number" required placeholder="50000"
                  value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
