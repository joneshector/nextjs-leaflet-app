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
        <div className={`${styles.customPopup} ${layoutMode === 'horizontal' ? styles.horizontalPopup : styles.verticalPopup}`}>
            <div className={styles.popupOverlay} onClick={onClose}></div>
            <div className={`${styles.mapCardContainer} ${layoutMode === 'horizontal' ? styles.horizontalCardContainer : styles.verticalCardContainer}`}>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>
                <div
                    className={
                        'absolute top-0 right-0 inline-flex py-2 px-4 md:py-3 md:px-7 flex flex-row justify-center rounded-3xl cursor-pointer items-center gap-3 border-rose-600'
                    }
                >
                    <button onClick={switchPreviousClub}>
                        <Triangle toggleRotate={true} color={'red'} />
                    </button>
                    <div>{clubIndex}</div>
                    <button onClick={switchNextClub}>
                        <Triangle toggleRotate={false} color={'red'} />
                    </button>
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
