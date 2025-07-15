'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Fuse, { FuseResult, FuseResultMatch } from 'fuse.js';
import styles from '../styling/ClubCard.module.css';
import { Club } from './OpenStreetMap';

interface SearchBarProps {
    clubs: Club[];
    onClubSelect: (clubIndex: number) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    clubs, 
    onClubSelect, 
    placeholder = "Search clubs..." 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<FuseResult<Club>[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [fuse, setFuse] = useState<Fuse<Club> | null>(null);
    
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initialize Fuse.js with search options
    useEffect(() => {
        const fuseOptions = {
            keys: [
                { name: 'name', weight: 0.7 },
                { name: 'description', weight: 0.3 }
            ],
            threshold: 0.4, // Lower = more strict, higher = more fuzzy
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 2,
            includeScore: true,
            includeMatches: true,
            shouldSort: true,
            location: 0,
        };
        
        const fuseInstance = new Fuse(clubs, fuseOptions);
        setFuse(fuseInstance);
    }, [clubs]);

    // Perform search when search term changes
    useEffect(() => {
        if (!fuse || !searchTerm.trim()) {
            setSearchResults([]);
            setIsDropdownVisible(false);
            setSelectedIndex(-1);
            return;
        }

        const results = fuse.search(searchTerm).slice(0, 3); // Top 3 results
        setSearchResults(results);
        setIsDropdownVisible(results.length > 0);
        setSelectedIndex(-1);
    }, [searchTerm, fuse]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isDropdownVisible || searchResults.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => 
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                event.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
                    handleClubSelect(searchResults[selectedIndex].refIndex);
                } else if (searchResults.length > 0) {
                    handleClubSelect(searchResults[0].refIndex);
                }
                break;
            case 'Escape':
                setIsDropdownVisible(false);
                setSelectedIndex(-1);
                searchInputRef.current?.blur();
                break;
        }
    }, [isDropdownVisible, searchResults, selectedIndex]);

    const handleClubSelect = (clubIndex: number) => {
        setSearchTerm('');
        setIsDropdownVisible(false);
        setSelectedIndex(-1);
        onClubSelect(clubIndex);
        searchInputRef.current?.blur();
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleInputFocus = () => {
        if (searchResults.length > 0) {
            setIsDropdownVisible(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding dropdown to allow for click on results
        setTimeout(() => {
            setIsDropdownVisible(false);
            setSelectedIndex(-1);
        }, 200);
    };

    const highlightMatch = (text: string, matches?: readonly FuseResultMatch[]) => {
        if (!matches || matches.length === 0) return text;
        
        const match = matches[0];
        if (!match.indices || match.indices.length === 0) return text;
        
        let result = '';
        let lastIndex = 0;
        
        match.indices.forEach(([start, end]) => {
            result += text.slice(lastIndex, start);
            result += `<mark class="${styles.searchHighlight}">${text.slice(start, end + 1)}</mark>`;
            lastIndex = end + 1;
        });
        
        result += text.slice(lastIndex);
        return result;
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchInputContainer}>
                <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    className={styles.searchInput}
                />
                <div className={styles.searchIcon}>🔍</div>
            </div>
            
            {isDropdownVisible && (
                <div ref={dropdownRef} className={styles.searchDropdown}>
                    {searchResults.map((result, index) => (
                        <div
                            key={`${result.item.slug}-${result.refIndex}`}
                            className={`${styles.searchResultItem} ${
                                index === selectedIndex ? styles.searchResultSelected : ''
                            }`}
                            onClick={() => handleClubSelect(result.refIndex)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className={styles.searchResultName}>
                                <span 
                                    dangerouslySetInnerHTML={{ 
                                        __html: highlightMatch(
                                            result.item.name, 
                                            result.matches?.filter(m => m.key === 'name')
                                        ) 
                                    }}
                                />
                            </div>
                            {/* <div className={styles.searchResultDescription}>
                                <span 
                                    dangerouslySetInnerHTML={{ 
                                        __html: highlightMatch(
                                            result.item.description || '', 
                                            result.matches?.filter(m => m.key === 'description')
                                        ) 
                                    }}
                                />
                            </div> */}
                            {result.score && (
                                <div className={styles.searchResultScore}>
                                    Match: {Math.round((1 - result.score) * 100)}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar; 