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
  let nextClubID: number;

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

    nextClubID = 0;

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
      nextClubID,
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
      clubs[nextClubID].geoLocation
    );

    // Verify map flyTo was called
    expect(mockMap.flyTo).toHaveBeenCalledWith(
      { lat: 52.5, lng: 13.4 },
      13
    );

    // Verify state setters were called
    expect(mockSetSelectedClub).toHaveBeenCalledWith(clubs[nextClubID]);
    expect(mockSetCenterCoords).toHaveBeenCalledWith({
      lat: 52.5,
      lng: clubs[nextClubID].geoLocation[1],
    });
    expect(mockSetClubIndex).toHaveBeenCalledWith(0); // Index of first club
  });

  it('should find correct club index', () => {
    const secondClub = 1;

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
      nextClubID,
      clubs,
      mockSetSelectedClub,
      mockSetCenterCoords,
      mockSetClubIndex
    );

    expect(mockOffsetMapCenter).toHaveBeenCalledWith(
      13,
      600, // Updated overlay height
      mockMap,
      clubs[nextClubID].geoLocation
    );
  });

  it('should handle different zoom levels', () => {
    (mockMap.getZoom as jest.Mock).mockReturnValue(15);

    jumpToMarker(
      mockMap,
      mockMainMapRef,
      nextClubID,
      clubs,
      mockSetSelectedClub,
      mockSetCenterCoords,
      mockSetClubIndex
    );

    expect(mockOffsetMapCenter).toHaveBeenCalledWith(
      15, // Updated zoom level
      400,
      mockMap,
      clubs[nextClubID].geoLocation
    );

    expect(mockMap.flyTo).toHaveBeenCalledWith(
      { lat: 52.5, lng: 13.4 },
      15 // Updated zoom level
    );
  });

  describe('Edge Cases', () => {
    it('should throw error when map is null', () => {
      expect(() => {
        jumpToMarker(
          null,
          mockMainMapRef,
          nextClubID,
          clubs,
          mockSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow();
    });

    it('should handle invalid club index (out of bounds - negative)', () => {
      const invalidClubIndex = -1;

      expect(() => {
        jumpToMarker(
          mockMap,
          mockMainMapRef,
          invalidClubIndex,
          clubs,
          mockSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow();
    });

    it('should handle invalid club index (out of bounds - too high)', () => {
      const invalidClubIndex = clubs.length;

      expect(() => {
        jumpToMarker(
          mockMap,
          mockMainMapRef,
          invalidClubIndex,
          clubs,
          mockSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow();
    });

    it('should handle empty clubs array', () => {
      const emptyClubs: Club[] = [];
      const invalidClubIndex = 0;

      expect(() => {
        jumpToMarker(
          mockMap,
          mockMainMapRef,
          invalidClubIndex,
          emptyClubs,
          mockSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow();
    });

    it('should handle clubs with invalid geoLocation data', () => {
      const clubsWithInvalidGeo: Club[] = [
        {
          name: 'Invalid Club',
          slug: 1,
          description: 'Club with invalid geo',
          geoLocation: [NaN, undefined] as any,
        }
      ];

      // The function doesn't validate geoLocation data, so it won't throw
      jumpToMarker(
        mockMap,
        mockMainMapRef,
        0,
        clubsWithInvalidGeo,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      expect(mockOffsetMapCenter).toHaveBeenCalledWith(
        13,
        400,
        mockMap,
        [NaN, undefined]
      );
    });

    it('should handle null mainMapRef', () => {
      const nullMainMapRef = { current: null };

      expect(() => {
        jumpToMarker(
          mockMap,
          nullMainMapRef,
          nextClubID,
          clubs,
          mockSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow();
    });

    it('should handle zero overlayHeight', () => {
      mockMainMapRef.current.offsetHeight = 0;

      jumpToMarker(
        mockMap,
        mockMainMapRef,
        nextClubID,
        clubs,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      expect(mockOffsetMapCenter).toHaveBeenCalledWith(
        13,
        0, // Zero overlay height
        mockMap,
        clubs[nextClubID].geoLocation
      );
    });

    it('should handle negative overlayHeight', () => {
      mockMainMapRef.current.offsetHeight = -100;

      jumpToMarker(
        mockMap,
        mockMainMapRef,
        nextClubID,
        clubs,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      expect(mockOffsetMapCenter).toHaveBeenCalledWith(
        13,
        -100, // Negative overlay height
        mockMap,
        clubs[nextClubID].geoLocation
      );
    });

    it('should handle when offsetMapCenter throws an error', () => {
      mockOffsetMapCenter.mockImplementation(() => {
        throw new Error('offsetMapCenter error');
      });

      expect(() => {
        jumpToMarker(
          mockMap,
          mockMainMapRef,
          nextClubID,
          clubs,
          mockSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow('offsetMapCenter error');
    });

    it('should handle when map.flyTo throws an error', () => {
      (mockMap.flyTo as jest.Mock).mockImplementation(() => {
        throw new Error('flyTo error');
      });

      expect(() => {
        jumpToMarker(
          mockMap,
          mockMainMapRef,
          nextClubID,
          clubs,
          mockSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow('flyTo error');
    });

    it('should handle when map.getZoom throws an error', () => {
      (mockMap.getZoom as jest.Mock).mockImplementation(() => {
        throw new Error('getZoom error');
      });

      expect(() => {
        jumpToMarker(
          mockMap,
          mockMainMapRef,
          nextClubID,
          clubs,
          mockSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow('getZoom error');
    });

    it('should handle club with missing slug', () => {
      const clubsWithMissingSlug: Club[] = [
        {
          name: 'Missing Slug Club',
          description: 'Club without slug',
          geoLocation: [52.517037, 13.38886],
        } as any
      ];

      jumpToMarker(
        mockMap,
        mockMainMapRef,
        0,
        clubsWithMissingSlug,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      // The club is at index 0 and findIndex finds the match (undefined === undefined)
      expect(mockSetClubIndex).toHaveBeenCalledWith(0);
    });

    it('should handle club with null slug', () => {
      const clubsWithNullSlug: Club[] = [
        {
          name: 'Null Slug Club',
          slug: null,
          description: 'Club with null slug',
          geoLocation: [52.517037, 13.38886],
        } as any
      ];

      jumpToMarker(
        mockMap,
        mockMainMapRef,
        0,
        clubsWithNullSlug,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      expect(mockSetClubIndex).toHaveBeenCalledWith(0);
    });

    it('should handle extreme zoom levels', () => {
      (mockMap.getZoom as jest.Mock).mockReturnValue(25); // Very high zoom

      jumpToMarker(
        mockMap,
        mockMainMapRef,
        nextClubID,
        clubs,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      expect(mockOffsetMapCenter).toHaveBeenCalledWith(
        25,
        400,
        mockMap,
        clubs[nextClubID].geoLocation
      );

      expect(mockMap.flyTo).toHaveBeenCalledWith(
        { lat: 52.5, lng: 13.4 },
        25
      );
    });

    it('should handle very large overlayHeight', () => {
      mockMainMapRef.current.offsetHeight = 10000;

      jumpToMarker(
        mockMap,
        mockMainMapRef,
        nextClubID,
        clubs,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      expect(mockOffsetMapCenter).toHaveBeenCalledWith(
        13,
        10000,
        mockMap,
        clubs[nextClubID].geoLocation
      );
    });

    it('should handle extreme coordinate values', () => {
      const clubsWithExtremeCoords: Club[] = [
        {
          name: 'Extreme Club',
          slug: 1,
          description: 'Club with extreme coordinates',
          geoLocation: [90, 180], // Max valid lat/lng
        }
      ];

      jumpToMarker(
        mockMap,
        mockMainMapRef,
        0,
        clubsWithExtremeCoords,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      expect(mockOffsetMapCenter).toHaveBeenCalledWith(
        13,
        400,
        mockMap,
        [90, 180]
      );
    });

    it('should handle when setter functions throw errors', () => {
      const errorSetSelectedClub = jest.fn(() => {
        throw new Error('setSelectedClub error');
      });

      expect(() => {
        jumpToMarker(
          mockMap,
          mockMainMapRef,
          nextClubID,
          clubs,
          errorSetSelectedClub,
          mockSetCenterCoords,
          mockSetClubIndex
        );
      }).toThrow('setSelectedClub error');
    });

    it('should handle concurrent calls', () => {
      // Reset call counts
      jest.clearAllMocks();

      // Call function multiple times rapidly
      jumpToMarker(
        mockMap,
        mockMainMapRef,
        0,
        clubs,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      jumpToMarker(
        mockMap,
        mockMainMapRef,
        1,
        clubs,
        mockSetSelectedClub,
        mockSetCenterCoords,
        mockSetClubIndex
      );

      // Both calls should complete successfully
      expect(mockMap.flyTo).toHaveBeenCalledTimes(2);
      expect(mockSetSelectedClub).toHaveBeenCalledTimes(2);
    });
  });
});
