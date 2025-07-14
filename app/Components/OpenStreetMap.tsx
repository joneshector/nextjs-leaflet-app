'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Map } from 'leaflet';
import styles from '../styling/ClubCard.module.css';
import CustomPopup from './CustomPopup'; // Import the custom popup component
import CustomMarker from './CustomMarker';
import ClubsList from './ClubsList'; // Import the clubs list component
import jumpToMarker from '../helpers/jumpToMarker';
import mod from '../helpers/mod';
import useDebounceFunction from '../helpers/useDebounceFunction';

export type Club = {
    name: string;
    slug: number;
    geoLocation: number[];
    description?: string;
};

export type LayoutMode = 'vertical' | 'horizontal';

const OpenStreetMap: React.FC = () => {
    const mainMapRef = useRef(null);
    const [map, setMap] = useState<Map | null>(null);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [clubIndex, setClubIndex] = useState<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [mapId] = useState(() => `map-${Date.now()}-${Math.random()}`);
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('vertical');
    const [centerCoords, setCenterCoords] = useState<{
        lat: number;
        lng: number;
    }>({
        lat: 52.51664,
        lng: 13.40828,
    });

    const clubs: Club[] = [
        {
            name: 'popupOne',
            slug: 1,
            description: 'This is popupOne.',
            geoLocation: [52.517037, 13.38886],
        },
        {
            name: 'popupTwo',
            slug: 2,
            description: 'This is popupTwo.',
            geoLocation: [52.588188, 13.430868],
        },
        {
            name: 'popupThree',
            slug: 3,
            description: 'This is popupThree.',
            geoLocation: [52.488419, 13.461284],
        },
        {
            name: 'popupFour',
            slug: 4,
            description: 'This is popupFour.',
            geoLocation: [52.517037, 13.38886],
        },
        {
            name: 'popupFive',
            slug: 5,
            description: 'This is popupFive.',
            geoLocation: [52.588188, 13.430868],
        },
        {
            name: 'popupSix',
            slug: 6,
            description: 'This is popupSix.',
            geoLocation: [52.488419, 13.461284],
        },
        {
            name: 'popupSeven',
            slug: 7,
            description: 'This is popupSeven.',
            geoLocation: [52.517037, 13.38886],
        },
        {
            name: 'popupEight',
            slug: 8,
            description: 'This is popupEight.',
            geoLocation: [52.588188, 13.430868],
        },
        {
            name: 'popupNine',
            slug: 9,
            description: 'This is popupNine.',
            geoLocation: [52.488419, 13.461284],
        },
        {
            name: 'popupTen',
            slug: 10,
            description: 'This is popupTen.',
            geoLocation: [52.517037, 13.38886],
        },
        {
            name: 'popupEleven',
            slug: 11,
            description: 'This is popupEleven.',
            geoLocation: [52.588188, 13.430868],
        },
        {
            name: 'popupTwelve',
            slug: 12,
            description: 'This is popupTwelve.',
            geoLocation: [52.488419, 13.461284],
        },
        {
            name: 'popupThirteen',
            slug: 13,
            description: 'This is popupThirteen.',
            geoLocation: [52.517037, 13.38886],
        },
        {
            name: 'popupFourteen',
            slug: 14,
            description: 'This is popupFourteen.',
            geoLocation: [52.588188, 13.430868],
        },
        {
            name: 'popupFifteen',
            slug: 15,
            description: 'This is popupFifteen.',
            geoLocation: [52.488419, 13.461284],
        },
        {
            name: 'popupSixteen',
            slug: 16,
            description: 'This is popupSixteen.',
            geoLocation: [52.517037, 13.38886],
        },
        {
            name: 'popupSeventeen',
            slug: 17,
            description: 'This is popupSeventeen.',
            geoLocation: [52.588188, 13.430868],
        },
        {
            name: 'popupEighteen',
            slug: 18,
            description: 'This is popupEighteen.',
            geoLocation: [52.488419, 13.461284],
        },
        {
            name: 'popupNineteen',
            slug: 19,
            description: 'This is popupNineteen.',
            geoLocation: [52.517037, 13.38886],
        },
        {
            name: 'popupTwenty',
            slug: 20,
            description: 'This is popupTwenty.',
            geoLocation: [52.588188, 13.430868],
        },
        {
            name: 'popupTwentyOne',
            slug: 21,
            description: 'This is popupTwentyOne.',
            geoLocation: [52.488419, 13.461284],
        },
    ];

    const zoom = 13;

    const setNextClub = useCallback(() => {
        setClubIndex(mod(clubIndex! + 1, clubs.length));
    }, [clubIndex, clubs.length]);

    const setPreviousClub = useCallback(() => {
        setClubIndex(mod(clubIndex! - 1, clubs.length));
    }, [clubIndex, clubs.length]);

    const debouncedMapFly = useDebounceFunction(
        (clubIndex) =>
            jumpToMarker(
                map,
                mainMapRef,
                clubIndex,
                clubs,
                setSelectedClub,
                setCenterCoords,
                setClubIndex
            ),
        100
    );

    // Handle club selection from search bar
    const handleSearchClubSelect = useCallback((clubIndex: number) => {
        if (map) {
            jumpToMarker(
                map,
                mainMapRef,
                clubIndex,
                clubs,
                setSelectedClub,
                setCenterCoords,
                setClubIndex
            );
        }
    }, [map, clubs]);

    // Ensure component only renders after hydration is complete
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Cleanup map on unmount
    useEffect(() => {
        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [map]);

    useEffect(() => {

        if (map) {
            debouncedMapFly(clubIndex);
        }

        // setTimeout(() => , 3000);

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowUp':
                    break;
                case 'ArrowDown':
                    break;
                case 'ArrowLeft':
                    setPreviousClub();
                    break;
                case 'ArrowRight':
                    setNextClub();
                    break;
                default:
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [clubIndex, map, setNextClub, setPreviousClub]);


    // Prevent rendering until after hydration and ensure we're in browser
    if (!isMounted || typeof window === 'undefined') {
        return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>;
    }

    // Create custom icon only after all checks pass
    const customIcon = L.icon({
        iconUrl: '../data/marker-icon.png',
        shadowUrl: '../data/marker-shadow.png',
        iconSize: [38, 38], // size of the icon
        iconAnchor: [19, 37], // point of the icon which will correspond to marker's location
        popupAnchor: [-3, -36], // point from which the popup should open relative to the iconAnchor
    });

    return (
        <>
            <div className={`${styles.mapContainerWithList} ${layoutMode === 'horizontal' ? styles.horizontalLayout : styles.verticalLayout}`} ref={mainMapRef}>
                {/* Layout Toggle Button */}
                <button
                    className={styles.layoutToggleButton}
                    onClick={() => setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical')}
                    title={`Switch to ${layoutMode === 'vertical' ? 'horizontal' : 'vertical'} layout`}
                >
                    {layoutMode === 'vertical' ? '⟷' : '⟺'}
                </button>

                <div className={styles.mapSection}>
                    <div id={mapId} style={{ height: '100%', width: '100%' }}>
                        <MapContainer
                            center={centerCoords}
                            zoom={zoom}
                            style={{ height: '100%', width: '100%' }}
                            ref={setMap}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {clubs.map((club, index) => (
                                <CustomMarker
                                    key={index}
                                    index={index}
                                    location={club.geoLocation}
                                    customIcon={customIcon}
                                    clickedOnMarker={() => {
                                        jumpToMarker(
                                            map,
                                            mainMapRef,
                                            index,
                                            clubs,
                                            setSelectedClub,
                                            setCenterCoords,
                                            setClubIndex
                                        );
                                    }}
                                />
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {selectedClub && (
                    <CustomPopup
                        clubIndex={
                            ((clubIndex as unknown as string) +
                                '/' +
                                clubs.length) as string
                        }
                        club={selectedClub}
                        layoutMode={layoutMode}
                        onClose={() => setSelectedClub(null)}
                        switchNextClub={() => {
                            setNextClub();
                        }}
                        switchPreviousClub={() => {
                            setPreviousClub();
                        }}
                    />
                )}
            </div>
            
            {/* Clubs List */}
            <ClubsList
                clubs={clubs}
                currentClubIndex={clubIndex}
                onClubSelect={handleSearchClubSelect}
            />
        </>
    );
};

export default OpenStreetMap;
