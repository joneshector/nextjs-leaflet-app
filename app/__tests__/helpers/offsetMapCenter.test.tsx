import offsetMapCenter from '../../helpers/offsetMapCenter';
import { Map, Point, LatLng } from 'leaflet';

// Mock Leaflet Map
const createMockMap = () => ({
  project: jest.fn(),
  unproject: jest.fn(),
} as unknown as Map);

// Mock Point
const createMockPoint = () => ({
  subtract: jest.fn(),
} as unknown as Point);

describe('offsetMapCenter', () => {
  let mockMap: Map;
  let mockPoint: Point;

  beforeEach(() => {
    mockMap = createMockMap();
    mockPoint = createMockPoint();
    jest.clearAllMocks();
  });

  it('should calculate offset map center correctly', () => {
    const targetZoom = 13;
    const overlayHeight = 400;
    const targetLocation = [52.517037, 13.38886];
    const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

    // Setup mocks
    (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
    (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
    (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

    const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

    // Verify the function calls
    expect(mockMap.project).toHaveBeenCalledWith(
      { lat: targetLocation[0], lng: targetLocation[1] },
      targetZoom
    );
    expect(mockPoint.subtract).toHaveBeenCalledWith([0, -overlayHeight / 3]);
    expect(mockMap.unproject).toHaveBeenCalledWith(mockPoint, targetZoom);
    expect(result).toBe(expectedLatLng);
  });

  it('should handle different overlay heights', () => {
    const targetZoom = 15;
    const overlayHeight = 600;
    const targetLocation = [52.588188, 13.430868];
    const expectedLatLng = { lat: 52.6, lng: 13.5 } as LatLng;

    (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
    (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
    (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

    const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

    expect(mockPoint.subtract).toHaveBeenCalledWith([0, -200]); // -overlayHeight / 3
    expect(result).toBe(expectedLatLng);
  });

  it('should handle different zoom levels', () => {
    const targetZoom = 10;
    const overlayHeight = 300;
    const targetLocation = [52.488419, 13.461284];

    (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
    (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
    (mockMap.unproject as jest.Mock).mockReturnValue({} as LatLng);

    offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

    expect(mockMap.project).toHaveBeenCalledWith(
      { lat: targetLocation[0], lng: targetLocation[1] },
      targetZoom
    );
    expect(mockMap.unproject).toHaveBeenCalledWith(mockPoint, targetZoom);
  });

  describe('Edge Cases', () => {
    it('should throw error when map is null', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];

      expect(() => {
        offsetMapCenter(targetZoom, overlayHeight, null, targetLocation);
      }).toThrow();
    });

    it('should handle zero overlay height', () => {
      const targetZoom = 13;
      const overlayHeight = 0;
      const targetLocation = [52.517037, 13.38886];
      const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockPoint.subtract).toHaveBeenCalledWith([0, -0]); // -overlayHeight / 3 = -0
      expect(result).toBe(expectedLatLng);
    });

    it('should handle negative overlay height', () => {
      const targetZoom = 13;
      const overlayHeight = -300;
      const targetLocation = [52.517037, 13.38886];
      const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockPoint.subtract).toHaveBeenCalledWith([0, 100]); // -(-300) / 3 = 100
      expect(result).toBe(expectedLatLng);
    });

    it('should handle very large overlay height', () => {
      const targetZoom = 13;
      const overlayHeight = Number.MAX_SAFE_INTEGER;
      const targetLocation = [52.517037, 13.38886];
      const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockPoint.subtract).toHaveBeenCalledWith([0, -Number.MAX_SAFE_INTEGER / 3]);
      expect(result).toBe(expectedLatLng);
    });

    it('should handle zero zoom level', () => {
      const targetZoom = 0;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];
      const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: targetLocation[0], lng: targetLocation[1] },
        0
      );
      expect(mockMap.unproject).toHaveBeenCalledWith(mockPoint, 0);
      expect(result).toBe(expectedLatLng);
    });

    it('should handle negative zoom level', () => {
      const targetZoom = -5;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];
      const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: targetLocation[0], lng: targetLocation[1] },
        -5
      );
      expect(result).toBe(expectedLatLng);
    });

    it('should handle very high zoom levels', () => {
      const targetZoom = 25;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];
      const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: targetLocation[0], lng: targetLocation[1] },
        25
      );
      expect(result).toBe(expectedLatLng);
    });

    it('should handle invalid target location coordinates', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [NaN, undefined as any];

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue({} as LatLng);

      offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: NaN, lng: undefined },
        targetZoom
      );
    });

    it('should handle extreme coordinate values', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [90, 180]; // Maximum valid lat/lng
      const expectedLatLng = { lat: 90, lng: 180 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: 90, lng: 180 },
        targetZoom
      );
      expect(result).toBe(expectedLatLng);
    });

    it('should handle out-of-bounds coordinates', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [200, -300]; // Out of valid lat/lng range
      const expectedLatLng = { lat: 200, lng: -300 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: 200, lng: -300 },
        targetZoom
      );
      expect(result).toBe(expectedLatLng);
    });

    it('should handle when map.project throws an error', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];

      (mockMap.project as jest.Mock).mockImplementation(() => {
        throw new Error('project error');
      });

      expect(() => {
        offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      }).toThrow('project error');
    });

    it('should handle when point.subtract throws an error', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockImplementation(() => {
        throw new Error('subtract error');
      });

      expect(() => {
        offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      }).toThrow('subtract error');
    });

    it('should handle when map.unproject throws an error', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockImplementation(() => {
        throw new Error('unproject error');
      });

      expect(() => {
        offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      }).toThrow('unproject error');
    });

    it('should handle empty target location array', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [] as any;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue({} as LatLng);

      offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: undefined, lng: undefined },
        targetZoom
      );
    });

    it('should handle target location with only one coordinate', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037] as any;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue({} as LatLng);

      offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: 52.517037, lng: undefined },
        targetZoom
      );
    });

    it('should handle null target location', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = null as any;

      expect(() => {
        offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      }).toThrow();
    });

    it('should handle undefined target location', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = undefined as any;

      expect(() => {
        offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      }).toThrow();
    });

    it('should handle NaN zoom level', () => {
      const targetZoom = NaN;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];
      const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: targetLocation[0], lng: targetLocation[1] },
        NaN
      );
      expect(result).toBe(expectedLatLng);
    });

    it('should handle Infinity values', () => {
      const targetZoom = Infinity;
      const overlayHeight = Infinity;
      const targetLocation = [Infinity, -Infinity];
      const expectedLatLng = { lat: Infinity, lng: -Infinity } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockPoint.subtract).toHaveBeenCalledWith([0, -Infinity]);
      expect(result).toBe(expectedLatLng);
    });

    it('should handle when map methods return null', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];

      (mockMap.project as jest.Mock).mockReturnValue(null);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(null);

      expect(() => {
        offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      }).toThrow();
    });

    it('should handle concurrent calls with same parameters', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];
      const expectedLatLng = { lat: 52.5, lng: 13.4 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      // Call multiple times
      const result1 = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      const result2 = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      const result3 = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(result1).toBe(expectedLatLng);
      expect(result2).toBe(expectedLatLng);
      expect(result3).toBe(expectedLatLng);

      expect(mockMap.project).toHaveBeenCalledTimes(3);
      expect(mockMap.unproject).toHaveBeenCalledTimes(3);
    });

    it('should handle precision edge cases with decimal coordinates', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037123456789, 13.388861234567891];
      const expectedLatLng = { lat: 52.517037123456789, lng: 13.388861234567891 } as LatLng;

      (mockMap.project as jest.Mock).mockReturnValue(mockPoint);
      (mockPoint.subtract as jest.Mock).mockReturnValue(mockPoint);
      (mockMap.unproject as jest.Mock).mockReturnValue(expectedLatLng);

      const result = offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);

      expect(mockMap.project).toHaveBeenCalledWith(
        { lat: 52.517037123456789, lng: 13.388861234567891 },
        targetZoom
      );
      expect(result).toBe(expectedLatLng);
    });

    it('should handle when point operations return unexpected types', () => {
      const targetZoom = 13;
      const overlayHeight = 400;
      const targetLocation = [52.517037, 13.38886];

      (mockMap.project as jest.Mock).mockReturnValue('not a point' as any);

      expect(() => {
        offsetMapCenter(targetZoom, overlayHeight, mockMap, targetLocation);
      }).toThrow();
    });
  });
});
