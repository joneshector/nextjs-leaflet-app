import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CustomPopup from '../../Components/CustomPopup';

// Mock the Triangle component
jest.mock('../../ui/triangle', () => {
  return function Triangle({ toggleRotate, color }: { toggleRotate: boolean; color: string }) {
    return <div data-testid="triangle" data-rotate={toggleRotate} data-color={color} />;
  };
});

describe('CustomPopup', () => {
  const mockClub = {
    name: 'Test Club',
    geoLocation: [52.517037, 13.38886],
    description: 'Test description',
  };

  const mockProps = {
    club: mockClub,
    clubIndex: '1/3',
    layoutMode: 'vertical' as const,
    onClose: jest.fn(),
    switchNextClub: jest.fn(),
    switchPreviousClub: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render popup with club information', () => {
    const { getByText } = render(<CustomPopup {...mockProps} />);
    
    expect(getByText('Test Club')).toBeInTheDocument();
    expect(getByText('Test description')).toBeInTheDocument();
    expect(getByText('1/3')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const { getByText } = render(<CustomPopup {...mockProps} />);
    
    const closeButton = getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    const { container } = render(<CustomPopup {...mockProps} />);
    
    const overlay = container.querySelector('.popupOverlay');
    fireEvent.click(overlay!);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call switchPreviousClub when previous button is clicked', () => {
    const { container } = render(<CustomPopup {...mockProps} />);
    
    const triangles = container.querySelectorAll('[data-testid="triangle"]');
    const previousButton = triangles[0].parentElement;
    fireEvent.click(previousButton!);
    
    expect(mockProps.switchPreviousClub).toHaveBeenCalledTimes(1);
  });

  it('should call switchNextClub when next button is clicked', () => {
    const { container } = render(<CustomPopup {...mockProps} />);
    
    const triangles = container.querySelectorAll('[data-testid="triangle"]');
    const nextButton = triangles[1].parentElement;
    fireEvent.click(nextButton!);
    
    expect(mockProps.switchNextClub).toHaveBeenCalledTimes(1);
  });

  it('should render triangles with correct props', () => {
    const { container } = render(<CustomPopup {...mockProps} />);
    
    const triangles = container.querySelectorAll('[data-testid="triangle"]');
    
    // Previous triangle (rotated)
    expect(triangles[0]).toHaveAttribute('data-rotate', 'true');
    expect(triangles[0]).toHaveAttribute('data-color', 'red');
    
    // Next triangle (not rotated)
    expect(triangles[1]).toHaveAttribute('data-rotate', 'false');
    expect(triangles[1]).toHaveAttribute('data-color', 'red');
  });

  it('should handle club without description', () => {
    const clubWithoutDescription = {
      name: 'Test Club',
      geoLocation: [52.517037, 13.38886],
    };
    
    const { getByText, queryByText } = render(
      <CustomPopup {...mockProps} club={clubWithoutDescription} />
    );
    
    expect(getByText('Test Club')).toBeInTheDocument();
    expect(queryByText('Test description')).not.toBeInTheDocument();
  });

  it('should display correct club index format', () => {
    const { getByText } = render(
      <CustomPopup {...mockProps} clubIndex="2/5" />
    );
    
    expect(getByText('2/5')).toBeInTheDocument();
  });
});
