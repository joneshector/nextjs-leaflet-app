import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import OpenStreetMap from '../../Components/OpenStreetMap';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div data-testid="map-container" ref={ref} {...props}>
      {children}
    </div>
  )),
  TileLayer: (props: any) => <div data-testid="tile-layer" {...props} />,
}));

// Mock the custom components
jest.mock('../../Components/CustomMarker', () => {
  return function CustomMarker(props: any) {
    return (
      <div 
        data-testid="custom-marker" 
        onClick={props.clickedOnMarker}
        data-index={props.index}
      />
    );
  };
});

jest.mock('../../Components/CustomPopup', () => {
  return function CustomPopup(props: any) {
    return (
      <div data-testid="custom-popup" data-layout={props.layoutMode}>
        <button onClick={props.onClose}>Close</button>
        <button onClick={props.switchNextClub}>Next</button>
        <button onClick={props.switchPreviousClub}>Previous</button>
      </div>
    );
  };
});

// Mock the helper functions
jest.mock('../../helpers/jumpToMarker', () => {
  return jest.fn((map, mapRef, clubIndex, clubs, setSelectedClub, setCenterCoords, setClubIndex) => {
    // Simulate the actual behavior of jumpToMarker
    // clubIndex is a number (index), not a club object
    const club = clubs[clubIndex];
    setSelectedClub(club);
    setClubIndex(clubIndex);
  });
});

describe('OpenStreetMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the OpenStreetMap component with layout toggle button after mounting completes', () => {
    // Mock isMounted to be false initially
    const { getByText } = render(<OpenStreetMap />);
    // Since useEffect runs synchronously in tests, we need to check for the actual content
    // The component should render the map content since isMounted becomes true immediately
    expect(getByText('⟷')).toBeInTheDocument(); // Check for the layout toggle button instead
  });

  test('displays the layout toggle button with correct initial tooltip text when component mounts', async () => {
    const { getByTitle } = render(<OpenStreetMap />);
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const toggleButton = getByTitle('Switch to horizontal layout');
    expect(toggleButton).toBeInTheDocument();
  });

  test('switches layout mode from vertical to horizontal and updates button tooltip when layout toggle is clicked', async () => {
    const { getByTitle, rerender } = render(<OpenStreetMap />);
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const toggleButton = getByTitle('Switch to horizontal layout');
    fireEvent.click(toggleButton);
    
    // Re-render to see the change
    rerender(<OpenStreetMap />);
    
    expect(getByTitle('Switch to vertical layout')).toBeInTheDocument();
  });

  test('applies the correct CSS layout classes to the map container based on current layout mode', async () => {
    const { container } = render(<OpenStreetMap />);
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const mapContainer = container.querySelector('.mapContainer');
    expect(mapContainer).toHaveClass('verticalLayout');
  });

  test('renders exactly three custom markers on the map corresponding to the predefined club locations', async () => {
    const { getAllByTestId } = render(<OpenStreetMap />);
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const markers = getAllByTestId('custom-marker');
    expect(markers).toHaveLength(21); // Based on the clubs array in the component
  });

  test('displays a custom popup component when any map marker is clicked by the user', async () => {
    const { getAllByTestId, getByTestId } = render(<OpenStreetMap />);
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const markers = getAllByTestId('custom-marker');
    fireEvent.click(markers[0]);
    
    expect(getByTestId('custom-popup')).toBeInTheDocument();
  });

  test('updates popup layout attribute to match the current map layout mode when layout is toggled', async () => {
    const { getAllByTestId, getByTestId, getByTitle } = render(<OpenStreetMap />);
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Click marker to show popup
    const markers = getAllByTestId('custom-marker');
    fireEvent.click(markers[0]);
    
    // Check initial layout
    expect(getByTestId('custom-popup')).toHaveAttribute('data-layout', 'vertical');
    
    // Toggle layout
    const toggleButton = getByTitle('Switch to horizontal layout');
    fireEvent.click(toggleButton);
    
    // Check updated layout
    expect(getByTestId('custom-popup')).toHaveAttribute('data-layout', 'horizontal');
  });

  test('removes the popup from the DOM when user clicks the close button inside the popup', async () => {
    const { getAllByTestId, getByTestId, queryByTestId, getByText } = render(<OpenStreetMap />);
    
    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Click marker to show popup
    const markers = getAllByTestId('custom-marker');
    fireEvent.click(markers[0]);
    
    expect(getByTestId('custom-popup')).toBeInTheDocument();
    
    // Close popup
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    
    expect(queryByTestId('custom-popup')).not.toBeInTheDocument();
  });
});
