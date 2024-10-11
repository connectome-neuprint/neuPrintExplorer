const NEURON_COLORS = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#fff'];
const input = {
  columns: ['A', 'B'],
  data: [
    [
      {
        'SMP(L)': true,
        'SNP(L)': true,
        bodyId: 5813002686,
        cropped: true,
        downstream: 110,
        post: 25,
        pre: 14,
        roiInfo:
          '{"SNP(L)": {"pre": 14, "post": 25, "downstream": 110, "upstream": 25}, "SMP(L)": {"pre": 14, "post": 25, "downstream": 110, "upstream": 25}}',
        size: 42269619,
        status: 'Traced',
        statusLabel: 'Leaves',
        upstream: 25,
      },
      {
        'SIP(L)': true,
        'SMP(L)': true,
        'SNP(L)': true,
        bodyId: 205973111,
        cropped: true,
        downstream: 7,
        post: 25,
        pre: 2,
        roiInfo:
          '{"SNP(L)": {"pre": 2, "post": 25, "downstream": 7, "upstream": 25}, "SMP(L)": {"pre": 2, "post": 21, "downstream": 7, "upstream": 21}, "SIP(L)": {"post": 4, "upstream": 4}}',
        size: 28302833,
        status: 'Traced',
        statusLabel: 'Leaves',
        upstream: 25,
      },
    ],
    [
      {
        'SMP(L)': true,
        'SNP(L)': true,
        bodyId: 298391966,
        cropped: true,
        downstream: 27,
        post: 2,
        pre: 3,
        roiInfo:
          '{"SNP(L)": {"pre": 3, "post": 2, "downstream": 27, "upstream": 2}, "SMP(L)": {"pre": 3, "post": 2, "downstream": 27, "upstream": 2}}',
        size: 3379534,
        status: 'Traced',
        statusLabel: 'Leaves',
        upstream: 2,
      },
      {
        'SIP(L)': true,
        'SMP(L)': true,
        'SNP(L)': true,
        bodyId: 205973111,
        cropped: true,
        downstream: 7,
        post: 25,
        pre: 2,
        roiInfo:
          '{"SNP(L)": {"pre": 2, "post": 25, "downstream": 7, "upstream": 25}, "SMP(L)": {"pre": 2, "post": 21, "downstream": 7, "upstream": 21}, "SIP(L)": {"post": 4, "upstream": 4}}',
        size: 28302833,
        status: 'Traced',
        statusLabel: 'Leaves',
        upstream: 25,
      },
    ],
    [
      {
        'SMP(L)': true,
        'SNP(L)': true,
        bodyId: 205636662,
        cropped: true,
        downstream: 75,
        post: 4,
        pre: 13,
        roiInfo:
          '{"SNP(L)": {"pre": 13, "post": 4, "downstream": 75, "upstream": 4}, "SMP(L)": {"pre": 13, "post": 4, "downstream": 75, "upstream": 4}}',
        size: 12359380,
        status: 'Traced',
        statusLabel: 'Leaves',
        upstream: 4,
      },
      {
        'SIP(L)': true,
        'SMP(L)': true,
        'SNP(L)': true,
        bodyId: 205973111,
        cropped: true,
        downstream: 7,
        post: 25,
        pre: 2,
        roiInfo:
          '{"SNP(L)": {"pre": 2, "post": 25, "downstream": 7, "upstream": 25}, "SMP(L)": {"pre": 2, "post": 21, "downstream": 7, "upstream": 21}, "SIP(L)": {"post": 4, "upstream": 4}}',
        size: 28302833,
        status: 'Traced',
        statusLabel: 'Leaves',
        upstream: 25,
      },
    ],
    [
      {
        'SIP(L)': true,
        'SMP(L)': true,
        'SNP(L)': true,
        bodyId: 237354635,
        cropped: true,
        downstream: 1049,
        post: 121,
        pre: 181,
        roiInfo:
          '{"SNP(L)": {"pre": 181, "post": 121, "downstream": 1049, "upstream": 121}, "SMP(L)": {"pre": 141, "post": 84, "downstream": 813, "upstream": 84}, "SIP(L)": {"pre": 40, "post": 37, "downstream": 236, "upstream": 37}}',
        size: 206948861,
        status: 'Traced',
        statusLabel: 'Leaves',
        upstream: 121,
      },
      {
        'SIP(L)': true,
        'SMP(L)': true,
        'SNP(L)': true,
        bodyId: 205973111,
        cropped: true,
        downstream: 7,
        post: 25,
        pre: 2,
        roiInfo:
          '{"SNP(L)": {"pre": 2, "post": 25, "downstream": 7, "upstream": 25}, "SMP(L)": {"pre": 2, "post": 21, "downstream": 7, "upstream": 21}, "SIP(L)": {"post": 4, "upstream": 4}}',
        size: 28302833,
        status: 'Traced',
        statusLabel: 'Leaves',
        upstream: 25,
      },
    ],
  ],
  debug: 'debug string',
};

const expected = {
  bodyIds: [5813002686, 205973111, 298391966, 205636662, 237354635],
  columns: ['Node Key', 'Type', 'Body Id', 'Status'],
  data: [
    {
      motif: 1,
      nodes: [
        ['A', 'type', '5813002686 - #f00', 'Traced'],
        ['B', 'type', '205973111 - #0f0', 'Traced'],
      ],
    },
    {
      motif: 2,
      nodes: [
        ['A', 'type', '298391966 - #f00', 'Traced'],
        ['B', 'type', '205973111 - #0f0', 'Traced'],
      ],
    },
    {
      motif: 3,
      nodes: [
        ['A', 'type', '205636662 - #f00', 'Traced'],
        ['B', 'type', '205973111 - #0f0', 'Traced'],
      ],
    },
    {
      motif: 4,
      nodes: [
        ['A', 'type', '237354635 - #f00', 'Traced'],
        ['B', 'type', '205973111 - #0f0', 'Traced'],
      ]
    }
  ],
  debug: 'debug string',
  title: 'Motif Search',
};

function processResults({ apiResponse }) {
  if (apiResponse.data) {
    const bodyIds = new Set();
    const data = [];
    apiResponse.data.forEach((row, index) => {
      const motif = {
        motif: index + 1,
        nodes: [],
      };

      row.forEach((item, itemIndex) => {
        const node = [
          apiResponse.columns[itemIndex],
          'type',
          `${item.bodyId} - ${NEURON_COLORS[itemIndex]}`,
          item.status,
        ];
        motif.nodes.push(node);
        bodyIds.add(item.bodyId);
      });

      data.push(motif);
    });
    return {
      columns: ['Node Key', 'Type', 'Body Id', 'Status'],
      data,
      debug: apiResponse.debug,
      title: 'Motif Search',
      bodyIds: Array.from(bodyIds),
    };
  }
  return {
    columns: [],
    data: [],
    debug: '',
  };
}

describe('Motif plugin', () => {
  it('processes results correctly', () => {
    const processed = processResults({ apiResponse: input });
    expect(processed).toEqual(expected);
  });
});
