import { FindNeurons } from './FindNeurons';

describe('FindNeurons Placeholder System', () => {
  const mockOnError = jest.fn();

  beforeEach(() => {
    mockOnError.mockClear();
  });

  it('should replace ROI_COLUMNS_PLACEHOLDER with actual ROI columns', () => {
    const query = {
      ds: 'test-placeholder',
      pm: {
        input_ROIs: ['ME(R)', 'LO(R)'],
        output_ROIs: ['MB(R)']
      }
    };

    // Mock ordered columns with placeholder
    const mockColumnsWithPlaceholder = [
      { id: 'status', name: 'status', visible: true },
      { id: 'type', name: 'type', visible: true },
      { id: 'ROI_COLUMNS_PLACEHOLDER', name: 'ROI Columns', visible: true },
      { id: 'bodyId', name: 'body ID', visible: true }
    ];
    // Add marker to indicate this came from neuronColumnsOrdered
    mockColumnsWithPlaceholder._isOrderedColumns = true;

    const defaultDatasetColumns = {
      'test-placeholder': mockColumnsWithPlaceholder
    };

    const headers = FindNeurons.getColumnHeaders(query, defaultDatasetColumns, mockOnError);
    const headerNames = headers.map(h => h.name || h.id);

    // Verify the placeholder was replaced with actual ROI columns
    expect(headerNames).toContain('status');
    expect(headerNames).toContain('type');

    // Should contain ROI columns generated from the query
    expect(headerNames).toContain('ME(R) #post');
    expect(headerNames).toContain('ME(R) #pre');
    expect(headerNames).toContain('LO(R) #post');
    expect(headerNames).toContain('LO(R) #pre');
    expect(headerNames).toContain('MB(R) #post');
    expect(headerNames).toContain('MB(R) #pre');

    expect(headerNames).toContain('body ID');

    // Should NOT contain the placeholder itself
    expect(headerNames).not.toContain('ROI Columns');

    // Verify order is maintained: status, type, ROI columns, bodyId
    const statusIndex = headerNames.indexOf('status');
    const typeIndex = headerNames.indexOf('type');
    const firstROIIndex = headerNames.indexOf('ME(R) #post');
    const bodyIdIndex = headerNames.indexOf('body ID');

    expect(statusIndex).toBeLessThan(typeIndex);
    expect(typeIndex).toBeLessThan(firstROIIndex);
    expect(firstROIIndex).toBeLessThan(bodyIdIndex);
  });

  it('should handle placeholder when no ROIs are selected', () => {
    const query = {
      ds: 'test-placeholder-empty',
      pm: {
        input_ROIs: [],
        output_ROIs: []
      }
    };

    // Mock ordered columns with placeholder
    const mockColumnsWithPlaceholder = [
      { id: 'status', name: 'status', visible: true },
      { id: 'ROI_COLUMNS_PLACEHOLDER', name: 'ROI Columns', visible: true },
      { id: 'bodyId', name: 'body ID', visible: true }
    ];
    mockColumnsWithPlaceholder._isOrderedColumns = true;

    const defaultDatasetColumns = {
      'test-placeholder-empty': mockColumnsWithPlaceholder
    };

    const headers = FindNeurons.getColumnHeaders(query, defaultDatasetColumns, mockOnError);
    const headerNames = headers.map(h => h.name || h.id);

    // Should not contain any ROI columns
    expect(headerNames).not.toContain('ME(R) #post');
    expect(headerNames).not.toContain('ROI Columns');

    // Should contain other columns
    expect(headerNames).toContain('status');
    expect(headerNames).toContain('body ID');
  });

  it('should process multiple placeholders in the same configuration', () => {
    const query = {
      ds: 'test-multiple-placeholders',
      pm: {
        input_ROIs: ['ME(R)'],
        output_ROIs: []
      }
    };

    // Mock ordered columns with multiple placeholders (for future extensions)
    const mockColumnsWithPlaceholders = [
      { id: 'status', name: 'status', visible: true },
      { id: 'ROI_COLUMNS_PLACEHOLDER', name: 'ROI Columns', visible: true },
      { id: 'bodyId', name: 'body ID', visible: true },
      // Future placeholder for other dynamic columns
      { id: 'FUTURE_PLACEHOLDER', name: 'Future Columns', visible: true }
    ];
    mockColumnsWithPlaceholders._isOrderedColumns = true;

    const defaultDatasetColumns = {
      'test-multiple-placeholders': mockColumnsWithPlaceholders
    };

    const headers = FindNeurons.getColumnHeaders(query, defaultDatasetColumns, mockOnError);
    const headerNames = headers.map(h => h.name || h.id);

    // Should replace ROI placeholder
    expect(headerNames).toContain('ME(R) #post');
    expect(headerNames).toContain('ME(R) #pre');

    // Should keep unknown placeholders as-is (for future extension)
    expect(headerNames).toContain('Future Columns');

    // Should not contain the ROI placeholder
    expect(headerNames).not.toContain('ROI Columns');
  });
});