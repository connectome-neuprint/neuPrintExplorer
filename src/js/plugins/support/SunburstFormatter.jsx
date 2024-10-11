import React from 'react';
import PropTypes from 'prop-types';
import Sunburst from '@neuprint/react-sunburst';

function processRaw(bodyId, rawData, superROIs, onError) {
  const data = {
    name: bodyId,
    children: [
      {
        name: 'upstream',
        children: []
      },
      { name: 'downstream', children: [] }
    ]
  };

  rawData.forEach(row => {
    const [targetId, type = 'none', , roisJSON, status, direction] = row;
    // check that the status is traced
    if (/(traced|anchor|leave)/i.test(status)) {
      // check if this is an input or an output
      const dirPosition = direction === 'upstream' ? 0 : 1;
      const topLevel = data.children[dirPosition];

      // sometimes we get an empty string instead of JSON. Do nothing in those
      // cases.
      if (roisJSON === '') {
        return;
      }

      const rois = JSON.parse(roisJSON);
      // filter to show only super ROIs
      Object.entries(rois)
        .filter(entry => superROIs.includes(entry[0]))
        .forEach(([roiLabel, roiData]) => {
          let roiLevel = topLevel.children.find(el => el.name === roiLabel);
          if (!roiLevel) {
            const roiObject = { name: roiLabel, children: [] };
            topLevel.children.push(roiObject);
            roiLevel = roiObject;
          }

          let typeLevel = roiLevel.children.find(el => el.name === type);
          if (!typeLevel) {
            const typeObject = { name: type, value: 0 };
            roiLevel.children.push(typeObject);
            typeLevel = typeObject;
          }
          // As the code loops over the rawData it adds the roiData.post value to the
          // total value for each ROI. In some cases that value was undefined, which
          // lead to the total value becoming NaN. This resulted in the removal of
          // the neuron type from the sunburst result. Now it logs a warning, but
          // keeps the total value for the ones that do have real numbers.
          if (roiData.post) {
            typeLevel.value += roiData.post;
          } else {
            onError(`roiData.post missing for bodyid ${targetId}`);
          }
        });
    }
  });
  return data;
}

export default function SunburstFormatter(props) {
  const { colors, bodyId, rawData, superROIs, onError } = props;

  const data = processRaw(bodyId, rawData, superROIs, onError);

  return (
    <div style={{ 'textAlign': 'center' , 'width': '100%', 'height': '100%'}}>
      <Sunburst data={data} colors={colors} preserveTopLevelOrder />
      <p>Connections are filtered to only those between traced neurons</p>
    </div>
  );
}

SunburstFormatter.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  rawData: PropTypes.arrayOf(PropTypes.array).isRequired,
  bodyId: PropTypes.number.isRequired,
  superROIs: PropTypes.arrayOf(PropTypes.string).isRequired,
  onError: PropTypes.func.isRequired
};

SunburstFormatter.defaultProps = {
  // colors: ['#e2b72f', '#396a9f']
  colors: ['#396a9f', '#e2b72f']
};
