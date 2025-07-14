'use client'
import dynamic from 'next/dynamic';

const DynamicOpenStreetMap = dynamic(
    () => import('@/app/Components/OpenStreetMap'),
    {
        ssr: false,
        loading: () => (
            <div style={{ 
                height: '100vh', 
                width: '100vw',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                margin: 0,
                padding: 0
            }}>
                Loading map...
            </div>
        )
    }
);

export default function Home() {
    return (
        <main style={{ margin: 0, padding: 0, height: '100vh', width: '100vw' }}>
            <DynamicOpenStreetMap />
        </main>
    );
}