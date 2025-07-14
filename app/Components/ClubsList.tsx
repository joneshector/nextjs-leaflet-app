'use client';
import React, { useRef, useEffect } from 'react';
import styles from '../styling/ClubCard.module.css';
import { Club } from './OpenStreetMap';
import SearchBar from './SearchBar';

interface ClubsListProps {
    clubs: Club[];
    currentClubIndex: number | null;
    onClubSelect: (clubIndex: number) => void;
}

const ClubsList: React.FC<ClubsListProps> = ({ clubs, currentClubIndex, onClubSelect }) => {
    const refs = useRef<(HTMLDivElement | null)[]>([]);

    const handleClubClick = (clubIndex: number) => {
        onClubSelect(clubIndex);
    };

    // Auto-scroll to selected club when it changes externally (e.g., from map markers or search)
    useEffect(() => {
        if (currentClubIndex !== null && refs.current[currentClubIndex]) {
            refs.current[currentClubIndex]!.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [currentClubIndex]);

    const getBackgroundColor = (index: number) => {
        return currentClubIndex === index ? styles.clubsListItemSelected : '';
    };

    return (
        <div className={styles.clubsListContainer}>
            <div className={styles.clubsListSearchSection}>
                <SearchBar 
                    clubs={clubs} 
                    onClubSelect={onClubSelect}
                    placeholder="Search clubs by name or description..."
                />
            </div>
            <div className={styles.clubsListHeader}>
                <h3>Clubs ({clubs.length})</h3>
            </div>
            <div className={styles.clubsListContent}>
                {clubs.map((club, index) => (
                    <div
                        key={club.slug}
                        className={`${styles.clubsListItem} ${getBackgroundColor(index)}`}
                        ref={(el) => {
                            refs.current[index] = el;
                            return;
                        }}
                        onClick={() => handleClubClick(index)}
                    >
                        <div className={styles.clubsListItemContent}>
                            <div className={styles.clubsListItemNumber}>
                                {index + 1}
                            </div>
                            <div className={styles.clubsListItemInfo}>
                                <h4 className={styles.clubsListItemName}>{club.name}</h4>
                                {club.description && (
                                    <p className={styles.clubsListItemDescription}>
                                        {club.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClubsList; 