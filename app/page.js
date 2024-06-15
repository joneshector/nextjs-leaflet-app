import Image from 'next/image';
import OpenStreetMap from './Components/OpenStreetMap';
import dynamic from 'next/dynamic';

export default function Home() {
    const OpenStreetMap = dynamic(
        () => import('@/app/Components/OpenStreetMap'),
        {
            ssr: false,
        }
    );
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <OpenStreetMap />
        </main>
    );
}
