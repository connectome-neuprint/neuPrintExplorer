import React from 'react';
import colormap from 'colormap';
import ColorBox from './ColorBox';

const viridisColorMap = colormap({
  colormap: 'viridis',
  nshades: 101,
  format: 'hex',
  alpha: 1
});

function RoiHeatMap({ roiInfoObject, roiInfoObjectKey, sumOfValues, listOfRoisToUse }) {
  const type = roiInfoObjectKey;
  const total = Math.max(sumOfValues, 0.01);

  return listOfRoisToUse.map(roi => {
    const percent = roiInfoObject[roi] ? ((roiInfoObject[roi][type] * 1.0) / total) * 100 : 0;
    return (
      <ColorBox
        margin={0}
        width={10}
        height={20}
        backgroundColor={
          roiInfoObject[roi]
            ? viridisColorMap[Math.floor(((roiInfoObject[roi][type] * 1.0) / total) * 100)]
            : viridisColorMap[0]
        }
        key={roi}
        title={`${roi  } ${  Math.round(percent * 100) / 100  }%`}
        text=""
      />
    );
  });
}

function HeatMapLabels({ roiList }) {
  const styles = {
    margin: '0px',
    width: '10px',
    height: '40px',
    overflow: 'visible',
    display: 'inline-flex',
    flexDirection: 'row',
    whiteSpace: 'nowrap',
    transform: 'rotate(-90deg) translateX(-40px)',
    transformOrigin: 'left top 0',
    fontSize: '10px'
  };
  return roiList.map(roi => (
      <div title={roi} style={styles} key={roi}>
        {roi}
      </div>
    ));
}

export function ColorLegend() {
  const styles = {
    display: 'inline-flex',
    overflow: 'visible',
    flexDirection: 'row'
  };

  return (
    <div style={styles}>
      {'0% '}{' '}
      {viridisColorMap.map((color, index) => {
        const key = `${color}${index}`;
        const divStyles = {
          margin: '0px',
          width: '2px',
          height: '10px',
          backgroundColor: color
        };
        return <div key={key} style={divStyles} />;
      })}
      {' 100%'}
    </div>
  );
}

export default ({ roiList, roiInfoObject, preTotal, postTotal }) => {
  const styles = {
    display: 'flex',
    flexDirection: 'row',
    margin: '5px'
  };

  const text = (
    <div key="labels" style={styles}>
      <HeatMapLabels roiList={roiList} />
    </div>
  );
  const hmPost = (
    <div key="post" style={styles}>
      <RoiHeatMap
        listOfRoisToUse={roiList}
        roiInfoObject={roiInfoObject}
        roiInfoObjectKey="post"
        sumOfValues={postTotal}
      />
      inputs
    </div>
  );
  const hmPre = (
    <div key="pre" style={styles}>
      <RoiHeatMap
        listOfRoisToUse={roiList}
        roiInfoObject={roiInfoObject}
        roiInfoObjectKey="pre"
        sumOfValues={preTotal}
      />
      outputs
    </div>
  );
  return [text, hmPost, hmPre];
};
