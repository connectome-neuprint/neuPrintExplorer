import { parseDatasetTimestamp } from './datasetUtils';

describe('parseDatasetTimestamp', () => {
  it('handles unknown timestamps', () => {
    expect(parseDatasetTimestamp('unknown')).toEqual(new Date(0));
    expect(parseDatasetTimestamp(null)).toEqual(new Date(0));
    expect(parseDatasetTimestamp(undefined)).toEqual(new Date(0));
    expect(parseDatasetTimestamp('')).toEqual(new Date(0));
  });

  it('handles simple timestamp format', () => {
    const result = parseDatasetTimestamp('2024-09-11 00:04:56.916796654-04:00');
    expect(result).toEqual(new Date('2024-09-11 00:04:56.916796654-04:00'));
  });

  it('handles ISO format with T separator', () => {
    const result = parseDatasetTimestamp('2025-09-29T23:44:02-04:00');
    expect(result).toEqual(new Date('2025-09-29T23:44:02-04:00'));
  });

  it('handles complex format with multiple timestamps', () => {
    const complexFormat = '2025-06-18 14:41:50.300008536-04:00 / 2025-09-29T23:44:02-04:00 (segment property update)';
    const result = parseDatasetTimestamp(complexFormat);

    // Should return the more recent timestamp (2025-09-29)
    const expectedDate = new Date('2025-09-29T23:44:02-04:00');
    expect(result).toEqual(expectedDate);
  });

  it('handles complex format and chooses most recent timestamp', () => {
    // Test with first timestamp being more recent
    const complexFormat = '2025-12-18 14:41:50.300008536-04:00 / 2025-09-29T23:44:02-04:00 (segment property update)';
    const result = parseDatasetTimestamp(complexFormat);

    // Should return the more recent timestamp (2025-12-18)
    const expectedDate = new Date('2025-12-18 14:41:50.300008536-04:00');
    expect(result).toEqual(expectedDate);
  });

  it('handles format with arbitrary text around timestamps', () => {
    const messyFormat = 'Dataset created on 2024-09-11T00:04:56Z and updated 2025-01-15T12:30:45-05:00 with additional metadata';
    const result = parseDatasetTimestamp(messyFormat);

    // Should return the more recent timestamp (2025-01-15)
    const expectedDate = new Date('2025-01-15T12:30:45-05:00');
    expect(result).toEqual(expectedDate);
  });

  it('handles date-only format', () => {
    const result = parseDatasetTimestamp('2024-09-11');
    expect(result).toEqual(new Date('2024-09-11'));
  });

  it('handles multiple date-only formats', () => {
    const multiDateFormat = 'Started 2024-01-01, updated 2024-06-15, finalized 2024-12-31';
    const result = parseDatasetTimestamp(multiDateFormat);

    // Should return the most recent date (2024-12-31)
    expect(result).toEqual(new Date('2024-12-31'));
  });

  it('handles mixed formats with different precision', () => {
    const mixedFormat = '2024-01-01 / 2024-06-15T10:30:00Z / 2024-12-31T23:59:59.999-05:00';
    const result = parseDatasetTimestamp(mixedFormat);

    // Should return the most recent timestamp (2024-12-31T23:59:59.999-05:00)
    const expectedDate = new Date('2024-12-31T23:59:59.999-05:00');
    expect(result).toEqual(expectedDate);
  });

  it('handles invalid date strings gracefully', () => {
    const invalidFormat = 'This is not a date at all, just random text';
    const result = parseDatasetTimestamp(invalidFormat);

    // Should return very old date when no valid timestamps found
    expect(result).toEqual(new Date(0));
  });

  it('handles malformed timestamps', () => {
    const malformedFormat = '2024-13-45T25:70:80-99:99 / some other text';
    const result = parseDatasetTimestamp(malformedFormat);

    // Should return very old date when no valid timestamps found
    expect(result).toEqual(new Date(0));
  });

  it('handles edge case with parentheses and extra text', () => {
    const edgeCase = 'Initial: 2024-01-01T00:00:00Z (created) / Final: 2024-12-31T23:59:59Z (completed processing)';
    const result = parseDatasetTimestamp(edgeCase);

    // Should return the more recent timestamp
    const expectedDate = new Date('2024-12-31T23:59:59Z');
    expect(result).toEqual(expectedDate);
  });

  it('sorts datasets correctly by parsed timestamps', () => {
    const mockDatasets = {
      datasetA: { lastmod: '2024-01-01T00:00:00Z' },
      datasetB: { lastmod: '2025-06-18 14:41:50.300008536-04:00 / 2025-09-29T23:44:02-04:00 (segment property update)' },
      datasetC: { lastmod: 'unknown' },
      datasetD: { lastmod: '2024-12-31T23:59:59Z' }
    };

    const sortedKeys = Object.keys(mockDatasets)
      .sort((a, b) => parseDatasetTimestamp(mockDatasets[b].lastmod) - parseDatasetTimestamp(mockDatasets[a].lastmod));

    // Expected order: datasetB (2025-09-29), datasetD (2024-12-31), datasetA (2024-01-01), datasetC (unknown)
    expect(sortedKeys).toEqual(['datasetB', 'datasetD', 'datasetA', 'datasetC']);
  });
});