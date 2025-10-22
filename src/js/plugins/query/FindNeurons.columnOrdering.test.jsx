import { FindNeurons } from './FindNeurons';

// Mock data that simulates responses from MSW
const mockLegacyColumns = [
  { id: 'bodyId', name: 'body ID', visible: true },
  { id: 'type', name: 'type', visible: true, after: 'bodyId' },
  { id: 'status', name: 'status', visible: true, after: 'type' }
];

const mockOrderedColumns = [
  { id: 'status', name: 'status', visible: true },
  { id: 'bodyId', name: 'body ID', visible: true },
  { id: 'type', name: 'type', visible: true },
  { id: 'class', name: 'class', visible: false },
  { id: 'instance', name: 'instance', visible: false }
];
// Add marker to indicate this came from neuronColumnsOrdered
mockOrderedColumns._isOrderedColumns = true;

describe('FindNeurons Column Ordering', () => {
  const mockOnError = jest.fn();

  beforeEach(() => {
    mockOnError.mockClear();
  });

  it('should use legacy ordering system when columns do not have _isOrderedColumns marker', () => {
    const query = {
      ds: 'test-legacy',
      pm: { input_ROIs: [], output_ROIs: [] }
    };

    const defaultDatasetColumns = {
      'test-legacy': mockLegacyColumns
    };

    const headers = FindNeurons.getColumnHeaders(query, defaultDatasetColumns, mockOnError);

    // Should fall back to legacy system and use orderColumns function
    // Expected order after processing: bodyId, type, status (based on 'after' relationships)
    // No _isOrderedColumns marker means this uses the legacy system
    const headerNames = headers.map(h => h.name || h.id);
    expect(headerNames).toContain('body ID'); // bodyId keeps its metadata name
    expect(headerNames).toContain('type');
    expect(headerNames).toContain('status');
  });

  it('should use new ordered system when columns have _isOrderedColumns marker', () => {
    const query = {
      ds: 'test-ordered',
      pm: { input_ROIs: [], output_ROIs: [] }
    };

    const defaultDatasetColumns = {
      'test-ordered': mockOrderedColumns
    };

    const headers = FindNeurons.getColumnHeaders(query, defaultDatasetColumns, mockOnError);

    // Should use new system - direct array order
    // Expected order: status, bodyId, type, class (hidden), instance (hidden)
    const visibleHeaders = headers.filter(h => h.status !== false);
    const visibleHeaderNames = visibleHeaders.map(h => h.name || h.id);

    expect(visibleHeaderNames[0]).toBe('status');
    expect(visibleHeaderNames[1]).toBe('body ID'); // bodyId keeps its name from metadata
    expect(visibleHeaderNames[2]).toBe('type');

    // Hidden columns should not appear in enabled columns
    expect(visibleHeaderNames).not.toContain('class');
    expect(visibleHeaderNames).not.toContain('instance');
  });

  it('should preserve exact order from neuronColumnsOrdered metadata', () => {
    const customOrderedColumns = [
      { id: 'instance', name: 'instance', visible: true },
      { id: 'class', name: 'class', visible: true },
      { id: 'bodyId', name: 'body ID', visible: true },
      { id: 'status', name: 'status', visible: true },
      { id: 'type', name: 'type', visible: true }
    ];
    // Add marker to indicate this came from neuronColumnsOrdered
    customOrderedColumns._isOrderedColumns = true;

    const query = {
      ds: 'test-custom-order',
      pm: { input_ROIs: [], output_ROIs: [] }
    };

    const defaultDatasetColumns = {
      'test-custom-order': customOrderedColumns
    };

    const headers = FindNeurons.getColumnHeaders(query, defaultDatasetColumns, mockOnError);
    const headerNames = headers.map(h => h.name || h.id);

    // Should maintain exact order from metadata
    expect(headerNames[0]).toBe('instance');
    expect(headerNames[1]).toBe('class');
    expect(headerNames[2]).toBe('body ID');
    expect(headerNames[3]).toBe('status');
    expect(headerNames[4]).toBe('type');
  });

  it('should fall back to default columns when no metadata is provided', () => {
    const query = {
      ds: 'unknown-dataset',
      pm: { input_ROIs: [], output_ROIs: [] }
    };

    const headers = FindNeurons.getColumnHeaders(query, null, mockOnError);

    // Should use default column setup
    const headerNames = headers.map(h => h.name || h.id);
    expect(headerNames).toContain('id');
    expect(headerNames).toContain('type');
    expect(headerNames).toContain('status');
  });
});