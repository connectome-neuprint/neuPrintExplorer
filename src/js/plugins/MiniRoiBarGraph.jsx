import React from 'react';
import PropTypes from 'prop-types';
import { pickTextColorBasedOnBgColorAdvanced } from 'plugins/support';
import ColorBox from 'plugins/ColorBox';

const colorArray = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc948',
  '#b07aa1',
  '#9c755f',
  '#bab0ac',
  '#9a4fb7'
];
let usedColorIndex = 0;
const pixelsPerPercentage = 4;
const roiToColorMap = {};

const mitobarstyle = {
  display: 'flex',
  flexDirection: 'row',
  margin: '5px',
  border: '1px solid #ddd',
  height: '20px',
  width: '100%',
  minWidth: '400px',
  fontSize: '14px',
  lineHeight: '19px'
};

function mitoTypeColorBlock({ name, count, total, color }) {
  const percentage = (parseInt(count, 10) / total) * 100 || 0;
  const boxstyle = {
    textAlign: 'center',
    overflow: 'hidden',
    background: color,
    width: `${percentage}%`,
    color: pickTextColorBasedOnBgColorAdvanced(color, '#fff', '#000')
  };

  const title = `${name} (${count})`;

  let text = '';
  if (percentage > 30) {
    text = title;
  } else if (percentage > 10) {
    text = count;
  }

  return (
    <div key={name} style={boxstyle} title={title}>
      {text}
    </div>
  );
}

mitoTypeColorBlock.propTypes = {
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired
};

export function MiniMitoByTypeBarGraph({ roiInfoObject, mitoTotal }) {
  if (mitoTotal === 0) {
    return (
      <ColorBox
        key="none"
        margin={0}
        width="100%"
        height={20}
        backgroundColor="#eeeeee"
        color="#cccccc"
        title="0%"
        text="0%"
      />
    );
  }
  // pick the top three rois
  // show break down of dark, medium, and light mitos
  const mitoColors = ['#4e79a7', '#f28e2b', '#e15759'];
  let topMitoCount = 0;
  const top3ROIs = Object.entries(roiInfoObject)
    // ignore rois that don't have a mito count since we don't want to see them
    // and they sort higher than those with a count in a strange way.
    .filter(roi => roi[1].mito && roi[1].mito > 0)
    .sort((a, b) => b[1].mito - a[1].mito)
    // we only want to see the top three entries.
    .slice(0, 3)
    .map(roi => {
      const { dark, light, medium, mito } = roi[1];
      topMitoCount = Math.max(mito, topMitoCount);
      const darkBlock = mitoTypeColorBlock({
        name: 'dark',
        count: dark,
        total: topMitoCount,
        color: mitoColors[0]
      });
      const lightBlock = mitoTypeColorBlock({
        name: 'light',
        count: light,
        total: topMitoCount,
        color: mitoColors[1]
      });
      const mediumBlock = mitoTypeColorBlock({
        name: 'medium',
        count: medium,
        total: topMitoCount,
        color: mitoColors[2]
      });

      return (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '5em' }}>{roi[0]}</div>
          <div style={mitobarstyle}>
            {darkBlock}
            {mediumBlock}
            {lightBlock}
          </div>
        </div>
      );
    });

  return <div>{top3ROIs}</div>;
}

MiniMitoByTypeBarGraph.propTypes = {
  roiInfoObject: PropTypes.object.isRequired,
  mitoTotal: PropTypes.number.isRequired
};

export function MiniMitoBarGraph({ roiInfoObject, mitoTotal }) {
  if (mitoTotal === 0) {
    return (
      <ColorBox
        key="none"
        margin={0}
        width="100%"
        height={20}
        backgroundColor="#eeeeee"
        color="#cccccc"
        title="0%"
        text="0%"
      />
    );
  }

  // loop over the entries and set rounded percentages
  let integerTotal = 0;
  const percentageList = Object.entries(roiInfoObject)
    .map(([name, values], i) => {
      if (values.mito) {
        const percentage = (parseInt(values.mito, 10) / mitoTotal) * 100 || 0;
        const integer = Math.floor(percentage);
        const remainder = Math.abs(percentage) - Math.floor(Math.abs(percentage));
        integerTotal += integer;

        let color = '#ccc';

        if (roiToColorMap[name]) {
          color = roiToColorMap[name];
        } else {
          color = colorArray[i - Math.floor(i / colorArray.length) * colorArray.length];
          roiToColorMap[name] = color;
        }

        return [name, integer, remainder, color];
      }
      return null;
    })
    .filter(item => item)
    // sort by the remainder so that we add 1 to the correct entries in the next loop.
    // this is important to make sure the values round up to 100%.
    .sort((a, b) => b[2] - a[2]);

  // do another loop make sure the values add up to 100%
  if (100 - integerTotal) {
    for (let i = 0; i < 100 - integerTotal; i += 1) {
      percentageList[i][1] += 1;
    }
  }

  // final loop assigns colors and converts it into a div.
  const colorBlocks = percentageList
    .filter(item => item[1] > 0)
    // sort the rois alphabetically by name.
    .sort((a, b) => {
      if (a[0] > b[0]) {
        return 1;
      }
      if (a[0] < b[0]) {
        return -1;
      }
      return 0;
    })
    .map(roi => {
      const [name, percentage, , color] = roi;
      const boxstyle = {
        textAlign: 'center',
        overflow: 'hidden',
        background: color,
        width: `${percentage}%`,
        color: pickTextColorBasedOnBgColorAdvanced(color, '#fff', '#000')
      };

      const title = `${name} ${percentage}%`;

      let text = '';
      if (percentage > 30) {
        text = title;
      } else if (percentage > 10) {
        text = `${percentage}%`;
      }

      return (
        <div key={name} style={boxstyle} title={title}>
          {text}
        </div>
      );
    });

  return <div style={mitobarstyle}>{colorBlocks}</div>;
}

MiniMitoBarGraph.propTypes = {
  roiInfoObject: PropTypes.object.isRequired,
  mitoTotal: PropTypes.number.isRequired
};

export function MiniROIBarGraph({ listOfRoisToUse, roiInfoObject, roiInfoObjectKey, sumOfValues }) {
  const type = roiInfoObjectKey;

  // if the total is 0 then bail out early, since the

  if (sumOfValues === 0) {
    return (
      <ColorBox
        key="none"
        margin={0}
        width={100 * pixelsPerPercentage}
        height={20}
        backgroundColor="#eeeeee"
        color="#cccccc"
        title="0%"
        text="0%"
      />
    );
  }

  let sumOfPercentages = 0;

  // to get a set of percentage that add up to 100% we need to do more than just round the
  // values off. See https://stackoverflow.com/questions/13483430/how-to-make-rounded-percentages-add-up-to-100
  // for more details.
  const roiWithColors = Object.keys(roiInfoObject)
    .map(roi => {
      if (listOfRoisToUse.find(element => element === roi)) {
        let color;
        if (roiToColorMap[roi]) {
          color = roiToColorMap[roi];
        } else {
          roiToColorMap[roi] = colorArray[usedColorIndex];
          color = colorArray[usedColorIndex];
          if (usedColorIndex < colorArray.length - 1) {
            usedColorIndex += 1;
          } else {
            usedColorIndex = 0;
          }
        }
        const percentage = ((roiInfoObject[roi][type] * 1.0) / sumOfValues) * 100 || 0;
        const integer = Math.floor(percentage);
        const decimal = Math.abs(percentage) - Math.floor(Math.abs(percentage));
        sumOfPercentages += integer;
        return [roi, integer, decimal, color];
      }
      return null;
    })
    .filter(item => item)
    .sort((a, b) => b[2] - a[2]);

  // loop over the results and add 1 to the values with the biggest remainder
  // until the sum = 100%. Assumes that the array is order by the decimal portion
  // due to the sorting of the roiWithColors array after the previous map operation.
  if (100 - sumOfPercentages) {
    for (let i = 0; i < 100 - sumOfPercentages; i += 1) {
      // check that 'i' is in the array. If it is out of range, then something went
      // wrong with the data and we can't calculate an accurate percentage.
      if (roiWithColors[i]) {
        roiWithColors[i][1] += 1;
      } else {
        return (
          <ColorBox
            key="error"
            margin={0}
            width={100 * pixelsPerPercentage}
            height={20}
            backgroundColor="#00000"
            color="#ff0000"
            borderColor="#ff0000"
            title="Error calculating %"
            text="Error calculating %"
          />
        );
      }
    }
  }

  const colors = roiWithColors
    .sort((a, b) => {
      if (a[0] < b[0]) {
        return -1;
      }
      if (a[0] > b[0]) {
        return 1;
      }
      return 0;
    })
    .map(roi => {
      const [roiName, integer, , color] = roi;
      // if percent turns out to be Nan, then we don't want to show it, so return nothing.
      if (!integer) {
        return null;
      }

      const name = roiName === 'None' ? 'Not Primary' : roiName;

      let text = '';
      if (integer > 30) {
        text = `${name} ${integer}%`;
      } else if (integer > 10) {
        text = `${integer}%`;
      }

      const textColor = pickTextColorBasedOnBgColorAdvanced(color, '#fff', '#000');
      return (
        <ColorBox
          key={roiName}
          margin={0}
          width={integer * pixelsPerPercentage}
          height={20}
          backgroundColor={color}
          color={textColor}
          title={`${name} ${integer}%`}
          text={text}
        />
      );
    });
  return colors;
}

MiniROIBarGraph.propTypes = {
  listOfRoisToUse: PropTypes.array.isRequired,
  roiInfoObject: PropTypes.object.isRequired,
  roiInfoObjectKey: PropTypes.string.isRequired,
  sumOfValues: PropTypes.number.isRequired
};

export default function InputOutputBarGraph({ roiList, roiInfoObject, preTotal, postTotal }) {
  const styles = {
    display: 'flex',
    flexDirection: 'row',
    margin: '5px'
  };

  const inputBar = (
    <div key="post" style={styles}>
      <MiniROIBarGraph
        roiInfoObject={roiInfoObject}
        listOfRoisToUse={roiList}
        roiInfoObjectKey="post"
        sumOfValues={postTotal}
      />
      inputs
    </div>
  );
  const outputBar = (
    <div key="pre" style={styles}>
      <MiniROIBarGraph
        roiInfoObject={roiInfoObject}
        listOfRoisToUse={roiList}
        roiInfoObjectKey="pre"
        sumOfValues={preTotal}
      />
      outputs
    </div>
  );

  return [inputBar, outputBar];
};

InputOutputBarGraph.propTypes = {
  roiList: PropTypes.array.isRequired,
  roiInfoObject: PropTypes.object.isRequired,
  preTotal: PropTypes.number.isRequired,
  postTotal: PropTypes.number.isRequired
};
