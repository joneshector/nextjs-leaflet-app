import jumpToMarker from '../../helpers/jumpToMarker';
import offsetMapCenter from '../../helpers/offsetMapCenter';
import { Map } from 'leaflet';
import { Club } from '../../Components/OpenStreetMap';

// Mock the offsetMapCenter function
jest.mock('../../helpers/offsetMapCenter');
const mockOffsetMapCenter = offsetMapCenter as jest.MockedFunction<typeof offsetMapCenter>;

describe('jumpToMarker', () => {
  let mockMap: Map;
  let mockMainMapRef: { current: { offsetHeight: number } };
  let mockSetSelectedClub: jest.Mock;
  let mockSetCenterCoords: jest.Mock;
  let mockSetClubIndex: jest.Mock;
  let clubs: Club[];
  let nextClub: Club;

  beforeEach(() => {
    mockMap = {
      getZoom: jest.fn(() => 13),
      flyTo: jest.fn(),
    } as unknown as Map;

    mockMainMapRef = {
      current: { offsetHeight: 400 }
    };

    mockSetSelectedClub = jest.fn();
    mockSetCenterCoords = jest.fn();
    mockSetClubIndex = jest.fn();

    clubs = [
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
    ];

    nextClub = clubs[0];

    mockOffsetMapCenter.mockReturnValue({
      lat: 52.5,
      lng: 13.4,
    } as any);

    jest.clearAllMocks();
  });

  it('should jump to marker and update state correctly', () => {
    jumpToMarker(
      mockMap,
      mockMainMapRef,
      nextClub,
      clubs,
      mockSetSelectedClub,
      mockSetCenterCoords,
      mockSetClubIndex
    );

    // Verify offsetMapCenter was called with correct parameters
    expect(mockOffsetMapCenter).toHaveBeenCalledWith(
      13, // targetZoom
      400, // overlayHeight
      mockMap,
      nextClub.geoLocation
    );

    // Verify map flyTo was called
    expect(mockMap.flyTo).toHaveBeenCalledWith(
      { lat: 52.5, lng: 13.4 },
      13
    );

    // Verify state setters were called
    expect(mockSetSelectedClub).toHaveBeenCalledWith(nextClub);
    expect(mockSetCenterCoords).toHaveBeenCalledWith({
      lat: 52.5,
      lng: nextClub.geoLocation[1],
    });
    expect(mockSetClubIndex).toHaveBeenCalledWith(0); // Index of first club
  });

  it('should find correct club index', () => {
    const secondClub = clubs[1];

    jumpToMarker(
      mockMap,
      mockMainMapRef,
      secondClub,
      clubs,
      mockSetSelectedClub,
      mockSetCenterCoords,
      mockSetClubIndex
    );

    expect(mockSetClubIndex).toHaveBeenCalledWith(1); // Index of second club
  });

  it('should handle different overlay heights', () => {
    mockMainMapRef.current.offsetHeight = 600;

    jumpToMarker(
      mockMap,
      mockMainMapRef,
      nextClub,
      clubs,
      mockSetSelectedClub,
      mockSetCenterCoords,
      mockSetClubIndex
    );

    expect(mockOffsetMapCenter).toHaveBeenCalledWith(
      13,
      600, // Updated overlay height
      mockMap,
      nextClub.geoLocation
    );
  });

  it('should handle different zoom levels', () => {
    (mockMap.getZoom as jest.Mock).mockReturnValue(15);

    jumpToMarker(
      mockMap,
      mockMainMapRef,
      nextClub,
      clubs,
      mockSetSelectedClub,
      mockSetCenterCoords,
      mockSetClubIndex
    );

    expect(mockOffsetMapCenter).toHaveBeenCalledWith(
      15, // Updated zoom level
      400,
      mockMap,
      nextClub.geoLocation
    );

    expect(mockMap.flyTo).toHaveBeenCalledWith(
      { lat: 52.5, lng: 13.4 },
      15 // Updated zoom level
    );
  });
});
