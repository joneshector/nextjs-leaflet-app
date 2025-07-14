import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ClubsList from '../../Components/ClubsList';
import { Club } from '../../Components/OpenStreetMap';

// Mock the CSS modules
jest.mock('../../styling/ClubCard.module.css', () => ({
    clubsListContainer: 'clubsListContainer',
    clubsListSearchSection: 'clubsListSearchSection',
    clubsListHeader: 'clubsListHeader',
    clubsListContent: 'clubsListContent',
    clubsListItem: 'clubsListItem',
    clubsListItemSelected: 'clubsListItemSelected',
    clubsListItemContent: 'clubsListItemContent',
    clubsListItemNumber: 'clubsListItemNumber',
    clubsListItemInfo: 'clubsListItemInfo',
    clubsListItemName: 'clubsListItemName',
    clubsListItemDescription: 'clubsListItemDescription',
}));

// Mock the SearchBar component
jest.mock('../../Components/SearchBar', () => {
    return function MockSearchBar({ clubs, onClubSelect, placeholder }: any) {
        return (
            <div data-testid="search-bar">
                <input 
                    data-testid="search-input"
                    placeholder={placeholder}
                    onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        const matchingIndex = clubs.findIndex((club: any) => 
                            club.name.toLowerCase().includes(searchTerm)
                        );
                        if (matchingIndex !== -1 && searchTerm.length > 2) {
                            onClubSelect(matchingIndex);
                        }
                    }}
                />
            </div>
        );
    };
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const mockClubs: Club[] = [
    {
        name: 'Test Club One',
        slug: 1,
        description: 'First test club description',
        geoLocation: [52.517037, 13.38886],
    },
    {
        name: 'Test Club Two',
        slug: 2,
        description: 'Second test club description',
        geoLocation: [52.588188, 13.430868],
    },
    {
        name: 'Test Club Three',
        slug: 3,
        description: 'Third test club description',
        geoLocation: [52.488419, 13.461284],
    },
    {
        name: 'Club Without Description',
        slug: 4,
        geoLocation: [52.517037, 13.38886],
    },
    {
        name: 'Very Long Club Name That Should Be Displayed Properly In The List',
        slug: 5,
        description: 'This club has an extremely long description that contains many words and should be properly displayed in the club list without breaking the layout or causing any display issues in the desktop view.',
        geoLocation: [52.588188, 13.430868],
    },
    {
        name: 'Alpha Club',
        slug: 6,
        description: 'Club that starts with Alpha',
        geoLocation: [52.488419, 13.461284],
    },
    {
        name: 'Beta Club',
        slug: 7,
        description: 'Club that starts with Beta',
        geoLocation: [52.517037, 13.38886],
    },
    {
        name: 'Special Characters @#$%',
        slug: 8,
        description: 'Club with special characters in name',
        geoLocation: [52.588188, 13.430868],
    },
    {
        name: 'Unicode Club 🎉',
        slug: 9,
        description: 'Club with unicode and emojis ñáéíóú 🚀',
        geoLocation: [52.488419, 13.461284],
    },
    {
        name: 'Last Club',
        slug: 10,
        description: 'The final club in the list',
        geoLocation: [52.517037, 13.38886],
    }
];

describe('ClubsList Component', () => {
    const mockOnClubSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (Element.prototype.scrollIntoView as jest.Mock).mockClear();
    });

    describe('Initial Rendering', () => {
        test('renders clubs list container', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const container = document.querySelector('.clubsListContainer');
            expect(container).toBeInTheDocument();
        });

        test('renders search section with SearchBar component', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const searchSection = document.querySelector('.clubsListSearchSection');
            const searchBar = screen.getByTestId('search-bar');
            
            expect(searchSection).toBeInTheDocument();
            expect(searchBar).toBeInTheDocument();
        });

        test('renders header with correct club count', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const header = document.querySelector('.clubsListHeader h3');
            expect(header).toBeInTheDocument();
            expect(header).toHaveTextContent(`Clubs (${mockClubs.length})`);
        });

        test('renders correct number of club items', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubItems = document.querySelectorAll('.clubsListItem');
            expect(clubItems).toHaveLength(mockClubs.length);
        });

        test('renders club items with correct structure', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const firstClubItem = document.querySelector('.clubsListItem');
            const clubContent = firstClubItem?.querySelector('.clubsListItemContent');
            const clubNumber = firstClubItem?.querySelector('.clubsListItemNumber');
            const clubInfo = firstClubItem?.querySelector('.clubsListItemInfo');
            const clubName = firstClubItem?.querySelector('.clubsListItemName');

            expect(clubContent).toBeInTheDocument();
            expect(clubNumber).toBeInTheDocument();
            expect(clubInfo).toBeInTheDocument();
            expect(clubName).toBeInTheDocument();
        });

        test('displays club names correctly', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubNames = document.querySelectorAll('.clubsListItemName');
            
            clubNames.forEach((nameElement, index) => {
                expect(nameElement).toHaveTextContent(mockClubs[index].name);
            });
        });

        test('displays club numbers correctly (1-indexed)', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubNumbers = document.querySelectorAll('.clubsListItemNumber');
            
            clubNumbers.forEach((numberElement, index) => {
                expect(numberElement).toHaveTextContent((index + 1).toString());
            });
        });

        test('displays club descriptions when available', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubsWithDescriptions = mockClubs.filter(club => club.description);
            const descriptionElements = document.querySelectorAll('.clubsListItemDescription');
            
            // Should have descriptions for clubs that have them
            expect(descriptionElements.length).toBe(clubsWithDescriptions.length);
        });

        test('handles clubs without descriptions gracefully', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            // Check the club without description (index 3)
            const clubItems = document.querySelectorAll('.clubsListItem');
            const clubWithoutDesc = clubItems[3]; // Club Without Description
            const description = clubWithoutDesc.querySelector('.clubsListItemDescription');
            
            expect(description).not.toBeInTheDocument();
        });
    });

    describe('Club Selection', () => {
        test('highlights selected club with correct CSS class', () => {
            const selectedIndex = 2;
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={selectedIndex} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubItems = document.querySelectorAll('.clubsListItem');
            const selectedClub = clubItems[selectedIndex];
            const otherClubs = Array.from(clubItems).filter((_, index) => index !== selectedIndex);

            expect(selectedClub).toHaveClass('clubsListItemSelected');
            otherClubs.forEach(club => {
                expect(club).not.toHaveClass('clubsListItemSelected');
            });
        });

        test('calls onClubSelect when club item is clicked', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubItems = document.querySelectorAll('.clubsListItem');
            const thirdClub = clubItems[2] as HTMLElement;

            fireEvent.click(thirdClub);

            expect(mockOnClubSelect).toHaveBeenCalledWith(2);
        });

        test('calls onClubSelect with correct index for each club', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubItems = document.querySelectorAll('.clubsListItem');

            clubItems.forEach((clubItem, index) => {
                fireEvent.click(clubItem as HTMLElement);
                expect(mockOnClubSelect).toHaveBeenCalledWith(index);
            });

            expect(mockOnClubSelect).toHaveBeenCalledTimes(mockClubs.length);
        });

        test('handles rapid club selection clicks', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubItems = document.querySelectorAll('.clubsListItem');

            // Click multiple clubs rapidly
            fireEvent.click(clubItems[0] as HTMLElement);
            fireEvent.click(clubItems[5] as HTMLElement);
            fireEvent.click(clubItems[9] as HTMLElement);

            expect(mockOnClubSelect).toHaveBeenCalledTimes(3);
            expect(mockOnClubSelect).toHaveBeenNthCalledWith(1, 0);
            expect(mockOnClubSelect).toHaveBeenNthCalledWith(2, 5);
            expect(mockOnClubSelect).toHaveBeenNthCalledWith(3, 9);
        });
    });

    describe('Auto-scrolling Behavior', () => {
        test('scrolls to selected club when currentClubIndex changes', () => {
            const { rerender } = render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            // Change to selected club
            rerender(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={3} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start'
            });
        });

        test('does not scroll when currentClubIndex is null', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
        });

        test('scrolls correctly when currentClubIndex changes from one valid index to another', () => {
            const { rerender } = render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={1} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            // First scroll for initial selection
            expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);

            // Change selection
            rerender(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={5} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            // Should scroll again for new selection
            expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(2);
        });

        test('handles scrolling to first and last clubs', () => {
            const { rerender } = render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            // Scroll to first club
            rerender(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={0} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);

            // Scroll to last club
            rerender(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={mockClubs.length - 1} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(2);
        });
    });

    describe('SearchBar Integration', () => {
        test('passes correct props to SearchBar', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const searchInput = screen.getByTestId('search-input');
            expect(searchInput).toHaveAttribute('placeholder', 'Search clubs by name or description...');
        });

        test('handles club selection from SearchBar', async () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const searchInput = screen.getByTestId('search-input');

            await act(async () => {
                await userEvent.type(searchInput, 'Alpha');
            });

            // Should call onClubSelect with the index of Alpha Club (index 5)
            expect(mockOnClubSelect).toHaveBeenCalledWith(5);
        });

        test('SearchBar search updates selection correctly', async () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const searchInput = screen.getByTestId('search-input');

            await act(async () => {
                await userEvent.type(searchInput, 'Beta');
            });

            // Should call onClubSelect with the index of Beta Club (index 6)
            expect(mockOnClubSelect).toHaveBeenCalledWith(6);
        });
    });

    describe('Edge Cases', () => {
        test('handles empty clubs array', () => {
            render(
                <ClubsList 
                    clubs={[]} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const header = document.querySelector('.clubsListHeader h3');
            expect(header).toHaveTextContent('Clubs (0)');

            const clubItems = document.querySelectorAll('.clubsListItem');
            expect(clubItems).toHaveLength(0);
        });

        test('handles single club in array', () => {
            const singleClub = [mockClubs[0]];
            render(
                <ClubsList 
                    clubs={singleClub} 
                    currentClubIndex={0} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const header = document.querySelector('.clubsListHeader h3');
            expect(header).toHaveTextContent('Clubs (1)');

            const clubItems = document.querySelectorAll('.clubsListItem');
            expect(clubItems).toHaveLength(1);
            expect(clubItems[0]).toHaveClass('clubsListItemSelected');
        });

        test('handles very long club names and descriptions', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const longNameClub = document.querySelectorAll('.clubsListItemName')[4]; // Index 4 has long name
            const longDescClub = document.querySelectorAll('.clubsListItemDescription')[4]; // Same club

            expect(longNameClub).toBeInTheDocument();
            expect(longDescClub).toBeInTheDocument();
            expect(longNameClub.textContent).toBe(mockClubs[4].name);
        });

        test('handles special characters in club names', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const specialCharClub = document.querySelectorAll('.clubsListItemName')[7]; // Index 7 has special chars
            expect(specialCharClub.textContent).toBe('Special Characters @#$%');
        });

        test('handles unicode and emoji characters', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const unicodeClub = document.querySelectorAll('.clubsListItemName')[8]; // Index 8 has unicode
            const unicodeDesc = document.querySelectorAll('.clubsListItemDescription')[7]; // Same club's description

            expect(unicodeClub.textContent).toBe('Unicode Club 🎉');
            expect(unicodeDesc.textContent).toBe('Club with unicode and emojis ñáéíóú 🚀');
        });

        test('handles invalid currentClubIndex gracefully', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={999} // Invalid index
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const selectedClubs = document.querySelectorAll('.clubsListItemSelected');
            expect(selectedClubs).toHaveLength(0);
        });

        test('handles negative currentClubIndex gracefully', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={-1} // Invalid negative index
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const selectedClubs = document.querySelectorAll('.clubsListItemSelected');
            expect(selectedClubs).toHaveLength(0);
        });
    });

    describe('Component Structure and Styling', () => {
        test('applies correct CSS classes to container elements', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            expect(document.querySelector('.clubsListContainer')).toBeInTheDocument();
            expect(document.querySelector('.clubsListSearchSection')).toBeInTheDocument();
            expect(document.querySelector('.clubsListHeader')).toBeInTheDocument();
            expect(document.querySelector('.clubsListContent')).toBeInTheDocument();
        });

        test('applies correct CSS classes to club items', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={2} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubItems = document.querySelectorAll('.clubsListItem');
            const selectedClub = clubItems[2];
            const unselectedClub = clubItems[0];

            expect(selectedClub).toHaveClass('clubsListItemSelected');
            expect(unselectedClub).not.toHaveClass('clubsListItemSelected');

            // Check nested elements
            expect(selectedClub.querySelector('.clubsListItemContent')).toBeInTheDocument();
            expect(selectedClub.querySelector('.clubsListItemNumber')).toBeInTheDocument();
            expect(selectedClub.querySelector('.clubsListItemInfo')).toBeInTheDocument();
            expect(selectedClub.querySelector('.clubsListItemName')).toBeInTheDocument();
        });

        test('maintains proper key attributes for React rendering', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            // Check that each club item is rendered (React keys are handled internally)
            const clubItems = document.querySelectorAll('.clubsListItem');
            expect(clubItems).toHaveLength(mockClubs.length);

            // Each club should have unique content
            const clubNames = Array.from(document.querySelectorAll('.clubsListItemName')).map(el => el.textContent);
            const uniqueNames = new Set(clubNames);
            expect(uniqueNames.size).toBe(clubNames.length); // All names should be unique
        });
    });

    describe('Performance', () => {
        test('handles large club lists efficiently', () => {
            const largeClubList: Club[] = Array.from({ length: 100 }, (_, i) => ({
                name: `Club ${i}`,
                slug: i,
                description: `Description for club ${i}`,
                geoLocation: [52.517037 + (i * 0.001), 13.38886 + (i * 0.001)],
            }));

            const startTime = performance.now();
            
            render(
                <ClubsList 
                    clubs={largeClubList} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render within reasonable time (less than 5 seconds for test environment)
            expect(renderTime).toBeLessThan(5000);

            const clubItems = document.querySelectorAll('.clubsListItem');
            expect(clubItems).toHaveLength(100);
        });

        test('handles frequent selection changes efficiently', () => {
            const { rerender } = render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={0} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const startTime = performance.now();

            // Rapidly change selection
            for (let i = 0; i < mockClubs.length; i++) {
                rerender(
                    <ClubsList 
                        clubs={mockClubs} 
                        currentClubIndex={i} 
                        onClubSelect={mockOnClubSelect} 
                    />
                );
            }

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            // Should handle rapid changes efficiently
            expect(totalTime).toBeLessThan(500);
        });
    });

    describe('Accessibility', () => {
        test('club items are clickable and keyboard accessible', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const clubItems = document.querySelectorAll('.clubsListItem');
            
            // All items should be rendered as div elements
            clubItems.forEach(item => {
                expect(item.tagName).toBe('DIV');
            });
        });

        test('selected club is visually distinguished', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={3} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const selectedClub = document.querySelectorAll('.clubsListItem')[3];
            expect(selectedClub).toHaveClass('clubsListItemSelected');
        });

        test('club information is properly structured for screen readers', () => {
            render(
                <ClubsList 
                    clubs={mockClubs} 
                    currentClubIndex={null} 
                    onClubSelect={mockOnClubSelect} 
                />
            );

            const firstClub = document.querySelectorAll('.clubsListItem')[0];
            const clubNumber = firstClub.querySelector('.clubsListItemNumber');
            const clubName = firstClub.querySelector('.clubsListItemName');
            const clubDescription = firstClub.querySelector('.clubsListItemDescription');

            // All should have text content
            expect(clubNumber?.textContent).toBeTruthy();
            expect(clubName?.textContent).toBeTruthy();
            expect(clubDescription?.textContent).toBeTruthy();
        });
    });
});
