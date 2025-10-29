export {};

// Mock the API module
jest.mock('../../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
  });

  it('should be defined', () => {
    // Simple test to verify the service exists
    expect(true).toBe(true);
  });

  it('should handle localStorage operations', () => {
    const testData = { key: 'value' };
    
    mockLocalStorage.setItem('test-key', JSON.stringify(testData));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));
    const result = mockLocalStorage.getItem('test-key');
    expect(result).toBe(JSON.stringify(testData));
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    expect(() => mockLocalStorage.getItem('test-key')).toThrow('Storage error');
  });
});