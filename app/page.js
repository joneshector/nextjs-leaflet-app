'use client'
import dynamic from 'next/dynamic';
import MapErrorBoundary from '@/app/Components/MapErrorBoundary';

const DynamicOpenStreetMap = dynamic(
    () => import('@/app/Components/OpenStreetMap'),
    {
        ssr: false,
        loading: () => (
            <div style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '8px'
            }}>
                Loading map...
            </div>
        )
    }
);

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <MapErrorBoundary 
                level="page"
                onError={(error, errorInfo) => {
                    // Log to external service in production
                    console.error('Page-level map error:', error, errorInfo);
                }}
            >
                <DynamicOpenStreetMap />
            </MapErrorBoundary>
        </main>
    );
}
