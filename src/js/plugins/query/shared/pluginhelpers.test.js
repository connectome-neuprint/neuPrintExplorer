import {
  createSimpleConnectionsResult,
  computeSimilarity,
  combineROIJSONStrings,
  getRoiInfoObjectWithNoneCount
} from './pluginhelpers';

const { actions, submit } = global;

describe('createSimpleConnectionsResult', () => {
  it('should return a simple connections query object', () => {
    const apiResponse = {
      columns: [
        'Neuron1',
        'Neuron2',
        'Neuron2Id',
        'Weight',
        'Neuron1Id',
        'Neuron2HasSkeleton',
        'Neuron2Status',
        'Neuron2RoiInfo',
        'Neuron2Size',
        'Neuron2Pre',
        'Neuron2Post',
        'rois'
      ],
      data: [
        [
          null,
          'FB-SMP',
          '(iPB)_L',
          5813046674,
          8,
          203253072,
          false,
          'Roughly traced',
          '{"a":{"pre":0,"post":1},"b":{"pre":44,"post":281},"c":{"pre":2,"post":4}}',
          483778179,
          46,
          289,
          ['a', 'b', 'c', 'd']
        ],
        [
          null,
          'FB-SMP',
          null,
          204276668,
          8,
          203253072,
          true,
          'Prelim Roughly traced',
          '{"b":{"pre":14,"post":342}}',
          83682381,
          15,
          343,
          ['a', 'b', 'c', 'd']
        ],
        [
          null,
          'FB-SMP',
          '(iPB)_L',
          203253253,
          7,
          203253072,
          true,
          'Roughly traced',
          '{"d":{"pre":14,"post":342}}',
          1604911588,
          333,
          2220,
          ['a', 'b', 'c', 'd']
        ]
      ],
      debug: 'testQuery'
    };

    const result = createSimpleConnectionsResult(
      'test',
      apiResponse,
      actions,
      submit,
      true,
      true // testing private version
    );
    const { columns, data, debug } = result;
    expect(debug).toEqual(apiResponse.debug);
    expect(columns.length).toBe(13);
    expect(data.length).toBe(3);
    expect(data[0].length).toBe(14);

    const resultPublic = createSimpleConnectionsResult(
      'test',
      apiResponse,
      actions,
      submit,
      true,
      false // testing public version
    );
    expect(resultPublic.debug).toEqual(apiResponse.debug);
    expect(resultPublic.columns.length).toBe(12);
    expect(resultPublic.data.length).toBe(3);
    expect(resultPublic.data[0].length).toBe(13);
  });
});

describe('computeSimilarity', () => {
  it('should compute similarity between input and output brain region vectors', () => {
    const inputVector = [0, 0.4, 0.6, 0, 1, 0]; // order : outputs, inputs
    const queriedVector = [0, 0.4, 0, 1, 0, 0];
    const { inputScore, outputScore, totalScore } = computeSimilarity(inputVector, queriedVector);
    expect(inputScore).toBe(1);
    expect(outputScore).toBe(0.3);
    expect(totalScore).toBe(0.65);
  });
  it('should throw error if inputs are undefined or contain NaN', () => {
    expect(() => {
      computeSimilarity(undefined, [0, 1]);
    }).toThrow();
    expect(() => {
      computeSimilarity([0, 1], undefined);
    }).toThrow();
    expect(() => {
      computeSimilarity([0, NaN], [0, 0]);
    }).toThrow();
    expect(() => {
      computeSimilarity([0, 1], [0, NaN]);
    }).toThrow();
  });
});

describe('combineROIJSONStrings', () => {
  it('should combine two ROI JSON strings together correctly', () => {
    const original = '{"a": {"pre": 2, "post": 3}}';
    const added = '{"a": {"pre": 3, "post": 3},"b": {"pre": 1, "post": 2}}';
    const expected = JSON.stringify({
      a: {
        pre: 5,
        post: 6
      },
      b: {
        pre: 1,
        post: 2
      }
    });
    const combined = combineROIJSONStrings(original, added);
    expect(combined).toEqual(expected);
  });
});

describe('getRoiInfoObjectWithNoneCount', () => {
  it('should return an object with pre & post counts that add up to the supplied total', () => {
    const roiList = [
      'ME(R)',
      'AME(R)',
      'CRE(L)',
      'SIP(L)',
      "a'L(L)"
    ];

    const original = {
      'SNP(L)': { post: 1 },
      'SIP(L)': { post: 1 },
      'MB(L)': { pre: 10, post: 12 },
      "a'L(L)": { pre: 10, post: 12 },
      INP: { pre: 8, post: 10 },
      'CRE(L)': { pre: 8, post: 10 },
      None: { pre: 1 }
    };
    const expected = {
      'SNP(L)': { post: 1 },
      'SIP(L)': { post: 1 },
      'MB(L)': { pre: 10, post: 12 },
      "a'L(L)": { pre: 10, post: 12 },
      INP: { pre: 8, post: 10 },
      'CRE(L)': { pre: 8, post: 10 },
      None: { pre: 1, post: 0 }
    };
    const noInput = getRoiInfoObjectWithNoneCount();
    expect(noInput).toBe(null);
    const computed = getRoiInfoObjectWithNoneCount(original, roiList, 19, 23);
    expect(computed).toEqual(expected);
  });
  it('should return an object with None added if needed and not supplied', () => {
    const roiList = [
      'ME(R)',
      'AME(R)',
      'CRE(L)',
      'SIP(L)',
      "a'L(L)"
    ];

    const original = {
      'SNP(L)': { post: 1 },
      'SIP(L)': { post: 1 },
      'MB(L)': { pre: 10, post: 12 },
      "a'L(L)": { pre: 10, post: 12 },
      INP: { pre: 8, post: 10 },
      'CRE(L)': { pre: 8, post: 10 }
    };
    const expected = {
      'SNP(L)': { post: 1 },
      'SIP(L)': { post: 1 },
      'MB(L)': { pre: 10, post: 12 },
      "a'L(L)": { pre: 10, post: 12 },
      INP: { pre: 8, post: 10 },
      'CRE(L)': { pre: 8, post: 10 },
      None: { pre: 1, post: 0 }
    };
    const computed = getRoiInfoObjectWithNoneCount(original, roiList, 19, 23);
    expect(computed).toEqual(expected);
  });

});
