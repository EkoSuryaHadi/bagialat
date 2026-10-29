// src/app/[slug]/page.tsx
import { Metadata } from 'next';
import { createServerSupabase } from '@/lib/supabaseServer';
import CatalogClient from './CatalogClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabase();
  const { data: shop } = await supabase
    .from('shops')
    .select('name, address, rental_items(status)')
    .eq('slug', params.slug)
    .single();

  if (!shop) return { title: 'Toko Tidak Ditemukan - TebarAlat' };

  const readyCount = shop.rental_items?.filter((i: any) => i.status === 'available').length || 0;

  return {
    title: `${shop.name} - Cek Katalog & Stok Sewa Hari Ini`,
    description: `🟢 ${readyCount} Unit Ready! Cek harga sewa harian/mingguan dan booking langsung via WhatsApp di ${shop.name} (${shop.address}).`,
    openGraph: {
      title: `📦 Katalog Sewa: ${shop.name}`,
      description: `🟢 ${readyCount} Alat Tersedia Hari Ini. Klik untuk cek harga & booking langsung via WA!`,
      type: 'website',
    },
  };
}

export default async function ShopCatalogPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabase();
  const { data: shop } = await supabase
    .from('shops')
    .select('*, rental_items(*)')
    .eq('slug', params.slug)
    .order('sort_order', { foreignTable: 'rental_items', ascending: true })
    .single();

  if (!shop) notFound();

  // Jangan kirim catatan internal penyewa (renter_private_note) ke halaman publik
  const sanitizedItems = shop.rental_items.map(({ renter_private_note, ...rest }: any) => rest);

  return <CatalogClient shop={shop} initialItems={sanitizedItems} />;
}
