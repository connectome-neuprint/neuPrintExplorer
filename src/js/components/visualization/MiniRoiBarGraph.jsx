import React from 'react';
import ColorBox from './ColorBox';

const colorArray = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc948',
  '#b07aa1',
  '#9c755f',
  '#bab0ac'
];
let usedColorIndex = 0;
const roiToColorMap = {};

function BarGraph({ listOfRoisToUse, roiInfoObject, roiInfoObjectKey, sumOfValues }) {
  const type = roiInfoObjectKey;
  const total = Math.max(sumOfValues, 0.01);

  return Object.keys(roiInfoObject).map(roi => {
    if (
      listOfRoisToUse.find(element => element === roi)
    ) {
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
      const percent = ((roiInfoObject[roi][type] * 1.0) / total) * 100;
      return (
        <ColorBox
          key={roi}
          margin={0}
          width={percent * 4}
          height={20}
          backgroundColor={color}
          title={`${roi  } ${  Math.round(percent * 100) / 100  }%`}
          text=""
        />
      );
    }
    return null;
  });
}

export default ({ roiList, roiInfoObject, preTotal, postTotal }) => {
  const styles = {
    display: 'flex',
    flexDirection: 'row',
    margin: '5px'
  };

  const inputBar = (
    <div key="post" style={styles}>
      <BarGraph
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
      <BarGraph
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
