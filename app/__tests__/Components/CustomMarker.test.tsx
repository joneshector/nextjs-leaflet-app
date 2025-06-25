import React from 'react';
import { render } from '@testing-library/react';
import CustomMarker from '../../Components/CustomMarker';
import L from 'leaflet';

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  Marker: ({ children, position, icon, eventHandlers, ...props }: any) => (
    <div 
      data-testid="marker" 
      data-position={`${position[0]},${position[1]}`}
      data-icon={icon ? icon.toString() : undefined}
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('CustomMarker', () => {
  const mockClickHandler = jest.fn();
  const mockIcon = {} as L.Icon<L.IconOptions>;
  const defaultProps = {
    index: 0,
    customIcon: mockIcon,
    location: [52.517037, 13.38886],
    clickedOnMarker: mockClickHandler,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders a marker component successfully in the DOM when provided with valid props', () => {
    const { getByTestId } = render(<CustomMarker {...defaultProps} />);
    
    const marker = getByTestId('marker');
    expect(marker).toBeInTheDocument();
  });

  test('correctly passes geographical coordinates as position data to the underlying Marker component', () => {
    const { getByTestId } = render(<CustomMarker {...defaultProps} />);
    
    const marker = getByTestId('marker');
    expect(marker).toHaveAttribute('data-position', '52.517037,13.38886');
  });

  test('properly attaches the provided custom icon object to the rendered marker element', () => {
    const { getByTestId } = render(<CustomMarker {...defaultProps} />);
    
    const marker = getByTestId('marker');
    expect(marker).toHaveAttribute('data-icon', '[object Object]');
  });

  test('adapts to different geographical locations and renders marker at the correct coordinates', () => {
    const differentLocation = [52.588188, 13.430868];
    const { getByTestId } = render(
      <CustomMarker {...defaultProps} location={differentLocation} />
    );
    
    const marker = getByTestId('marker');
    expect(marker).toHaveAttribute('data-position', '52.588188,13.430868');
  });

  test('successfully renders markers with various index values without causing rendering issues', () => {
    const { getByTestId } = render(
      <CustomMarker {...defaultProps} index={5} />
    );
    
    const marker = getByTestId('marker');
    expect(marker).toBeInTheDocument();
  });

  test('accepts click event handler prop without automatically triggering it during component render', () => {
    const { getByTestId } = render(<CustomMarker {...defaultProps} />);
    
    const marker = getByTestId('marker');
    // Since our mock doesn't actually render eventHandlers as DOM attributes,
    // we'll just check that the marker renders and the mock was called correctly
    expect(marker).toBeInTheDocument();
    expect(mockClickHandler).not.toHaveBeenCalled(); // Handler shouldn't be called on render
  });
});
