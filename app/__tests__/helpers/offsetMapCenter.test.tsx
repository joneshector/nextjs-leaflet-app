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
});
