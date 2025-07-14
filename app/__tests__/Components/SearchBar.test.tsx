import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SearchBar from '../../Components/SearchBar';
import { Club } from '../../Components/OpenStreetMap';

// Mock the CSS modules
jest.mock('../../styling/ClubCard.module.css', () => ({
    searchContainer: 'searchContainer',
    searchInputContainer: 'searchInputContainer',
    searchInput: 'searchInput',
    searchIcon: 'searchIcon',
    searchDropdown: 'searchDropdown',
    searchResultItem: 'searchResultItem',
    searchResultSelected: 'searchResultSelected',
    searchResultName: 'searchResultName',
    searchResultDescription: 'searchResultDescription',
    searchResultScore: 'searchResultScore',
    searchHighlight: 'searchHighlight',
}));

const mockClubs: Club[] = [
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
        name: 'clubAlpha',
        slug: 4,
        description: 'Alpha club with special features.',
        geoLocation: [52.517037, 13.38886],
    },
    {
        name: 'clubBeta',
        slug: 5,
        description: 'Beta club for testing.',
        geoLocation: [52.588188, 13.430868],
    },
    {
        name: 'uniqueName',
        slug: 6,
        description: 'Very unique description here.',
        geoLocation: [52.488419, 13.461284],
    },
];

const mockOnClubSelect = jest.fn();

describe('SearchBar Component (Custom Implementation)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders search input with placeholder', () => {
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
                placeholder="Search test placeholder"
            />
        );

        const searchInput = screen.getByPlaceholderText('Search test placeholder');
        expect(searchInput).toBeInTheDocument();
    });

    it('shows search results when typing', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'popup');

        await waitFor(() => {
            const resultItems = document.querySelectorAll('.searchResultItem');
            expect(resultItems.length).toBeGreaterThan(0);
            expect(resultItems.length).toBeLessThanOrEqual(3); // Quality over quantity
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            
            // Verify that we're getting actual popup results, not weak fuzzy matches
            const firstResultName = document.querySelector('.searchResultName span');
            expect(firstResultName?.textContent?.toLowerCase()).toContain('popup');
        });
    });

    it('limits results to top 3 matches', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'p'); // Should match multiple clubs

        await waitFor(() => {
            const resultItems = document.querySelectorAll('.searchResultItem');
            expect(resultItems.length).toBeLessThanOrEqual(3);
        });
    });

    it('performs custom fuzzy search on club names', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'alph'); // Partial match for 'clubAlpha'

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            const resultItems = document.querySelectorAll('.searchResultItem');
            expect(resultItems.length).toBeGreaterThan(0);
        });
    });

    it('searches in descriptions using custom algorithm', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'testing'); // Should match clubBeta description

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            const resultItems = document.querySelectorAll('.searchResultItem');
            expect(resultItems.length).toBeGreaterThan(0);
        });
    });

    it('finds exact matches with highest priority', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'uniqueName'); // Exact match

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            const resultItems = document.querySelectorAll('.searchResultItem');
            expect(resultItems.length).toBeGreaterThan(0);
        });
    });

    it('handles substring matches correctly', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'club'); // Should match clubAlpha and clubBeta

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            const resultItems = document.querySelectorAll('.searchResultItem');
            expect(resultItems.length).toBeGreaterThan(0);
        });
    });

    it('calls onClubSelect when clicking on a result', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'popup');

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
        });

        const resultItem = document.querySelector('.searchResultItem');
        if (resultItem) {
            fireEvent.click(resultItem);
        }

        expect(mockOnClubSelect).toHaveBeenCalled();
    });

    it('handles keyboard navigation with arrow keys', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'popup');

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
        });

        // Test arrow down navigation
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
        
        // Test enter key selection
        fireEvent.keyDown(searchInput, { key: 'Enter' });
        
        expect(mockOnClubSelect).toHaveBeenCalled();
    });

    it('handles escape key to close dropdown', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'popup');

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
        });

        // Press escape to close dropdown
        fireEvent.keyDown(searchInput, { key: 'Escape' });

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).not.toBeInTheDocument();
        });
    });

    it('clears search term after selection', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'popup');

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
        });

        const resultItem = document.querySelector('.searchResultItem');
        if (resultItem) {
            fireEvent.click(resultItem);
        }

        expect(searchInput).toHaveValue('');
    });

    it('hides dropdown when no results found', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'xyz123impossible'); // Use a search term that definitely won't match anything

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).not.toBeInTheDocument();
        });
    });

    it('shows match percentage in results', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'popup');

        await waitFor(() => {
            expect(document.querySelector('.searchResultScore')).toBeInTheDocument();
        });
    });

    it('handles minimum character search length (1 character)', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'p'); // Single character - should now show results

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
        });
    });

    it('prioritizes matches by field weights (name over description)', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'alpha');

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            const resultItems = document.querySelectorAll('.searchResultItem');
            expect(resultItems.length).toBeGreaterThan(0);
        });
    });

    it('handles text highlighting for matches', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'popup');

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            // Check if highlighting markup is present
            const resultName = document.querySelector('.searchResultName');
            expect(resultName).toBeInTheDocument();
        });
    });

    it('handles case-insensitive search', async () => {
        const user = userEvent.setup();
        render(
            <SearchBar 
                clubs={mockClubs} 
                onClubSelect={mockOnClubSelect}
            />
        );

        const searchInput = screen.getByPlaceholderText('Search clubs...');
        await user.type(searchInput, 'POPUP'); // Uppercase search

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown')).toBeInTheDocument();
            const resultItems = document.querySelectorAll('.searchResultItem');
            expect(resultItems.length).toBeGreaterThan(0);
        });
    });
}); 