'use client';
import React from 'react';
import styles from '../styling/ClubCard.module.css';
import Triangle from '../ui/triangle';
import { LayoutMode } from './OpenStreetMap';

interface Club {
    name: string;
    geoLocation: number[];
    description?: string;
}

interface CustomPopupProps {
    club: Club;
    clubIndex: string;
    layoutMode: LayoutMode;
    onClose: () => void;
    switchNextClub: () => void;
    switchPreviousClub: () => void;
}

const CustomPopup: React.FC<CustomPopupProps> = ({
    club,
    onClose,
    switchNextClub,
    switchPreviousClub,
    clubIndex,
    layoutMode,
}) => {
    return (
        <div 
            className={`${styles.customPopup} ${layoutMode === 'horizontal' ? styles.horizontalPopup : styles.verticalPopup}`}
            data-testid="custom-popup"
            data-layout={layoutMode}
        >
            <div className={styles.popupOverlay} onClick={onClose}></div>
            <div className={`${styles.mapCardContainer} ${layoutMode === 'horizontal' ? styles.horizontalCardContainer : styles.verticalCardContainer}`}>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>
                
                {/* Navigation arrows positioned at card edges */}
                <button className={styles.leftArrowButton} onClick={switchPreviousClub}>
                    <Triangle toggleRotate={true} color={'red'} />
                </button>
                
                <button className={styles.rightArrowButton} onClick={switchNextClub}>
                    <Triangle toggleRotate={false} color={'red'} />
                </button>
                
                {/* Club index indicator */}
                <div className={styles.clubIndexIndicator}>
                    {clubIndex}
                </div>
                
                <div className={styles.mapCard}>
                    <div className="flex justify-center items-center"></div>
                    <div className={styles.mapCardContent}>
                        <h3 className={styles.mapCardTitle}>{club.name}</h3>
                        <p className={styles.mapCardOfferings}>
                            {club.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomPopup;