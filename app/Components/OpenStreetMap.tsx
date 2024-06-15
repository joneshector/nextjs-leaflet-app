'use client';
import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Map } from 'leaflet';
import styles from '../styling/ClubCard.module.css';
import CustomPopup from './CustomPopup'; // Import the custom popup component
import CustomMarker from './CustomMarker';
import jumpToMarker from '../helpers/jumpToMarker';

export type Club = {
    name: string;
    slug: number;
    geoLocation: number[];
    description?: string;
};

const customIcon: L.Icon<L.IconOptions> = L.icon({
    iconUrl: '../data/marker-icon.png',
    shadowUrl: '../data/marker-shadow.png',

    iconSize: [38, 38], // size of the icon
    iconAnchor: [19, 37], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -36], // point from which the popup should open relative to the iconAnchor
});

const OpenStreetMap: React.FC = () => {
    const mainMapRef = useRef(null);
    const [map, setMap] = useState<Map | null>(null);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [clubIndex, setClubIndex] = useState<number | null>(null);
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
    ];

    const zoom = 13;

    function getNextClub(clubIndex: number, clubs: Club[]): Club {
        return clubIndex + 1 > clubs.length - 1
            ? clubs[0]
            : clubs[clubIndex + 1];
    }

    function getPreviousClub(clubIndex: number, clubs: Club[]): Club {
        return clubIndex - 1 < 0
            ? clubs[clubs.length - 1]
            : clubs[clubIndex - 1];
    }

    return (
        <div className={styles.mapContainer} ref={mainMapRef}>
            <MapContainer
                key={0}
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
                        index={index}
                        location={club.geoLocation}
                        customIcon={customIcon}
                        clickedOnMarker={() => {
                            jumpToMarker(
                                map,
                                mainMapRef,
                                club,
                                clubs,
                                setSelectedClub,
                                setCenterCoords,
                                setClubIndex
                            );
                        }}
                    />
                ))}
            </MapContainer>
            {selectedClub && (
                <CustomPopup
                    clubIndex={
                        ((clubIndex as unknown as string) +
                            '/' +
                            clubs.length) as string
                    }
                    club={selectedClub}
                    onClose={() => setSelectedClub(null)}
                    switchNextClub={() => {
                        const nextClub: Club = getNextClub(clubIndex!, clubs);
                        jumpToMarker(
                            map,
                            mainMapRef,
                            nextClub,
                            clubs,
                            setSelectedClub,
                            setCenterCoords,
                            setClubIndex
                        );
                    }}
                    switchPreviousClub={() => {
                        const previousClub: Club = getPreviousClub(
                            clubIndex!,
                            clubs
                        );
                        jumpToMarker(
                            map,
                            mainMapRef,
                            previousClub,
                            clubs,
                            setSelectedClub,
                            setCenterCoords,
                            setClubIndex
                        );
                    }}
                />
            )}
        </div>
    );
};

export default OpenStreetMap;
