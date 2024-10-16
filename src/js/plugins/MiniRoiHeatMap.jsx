import React from 'react';
import PropTypes from 'prop-types';
import colormap from 'colormap';
import ColorBox from './ColorBox';

const viridisColorMap = colormap({
  colormap: 'viridis',
  nshades: 101,
  format: 'hex',
  alpha: 1
});

export function RoiHeatMap({ roiInfoObject, roiInfoObjectKey, sumOfValues, listOfRoisToUse }) {
  const type = roiInfoObjectKey;
  const total = Math.max(sumOfValues, 0.01);

  return listOfRoisToUse.map(roi => {
    const name = roi === 'None' ? 'Not Primary' : roi;
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
        title={`${name} ${Math.round(percent * 100) / 100}%`}
        text=""
      />
    );
  });
}

export function HeatMapLabels({ roiList }) {
  const styles = {
    margin: '0px',
    width: '10px',
    height: '50px',
    overflow: 'visible',
    display: 'inline-flex',
    flexDirection: 'row',
    whiteSpace: 'nowrap',
    transform: 'rotate(-90deg) translateX(-50px)',
    transformOrigin: 'left top 0',
    fontSize: '10px'
  };
  return roiList.map(roi => {
    const name = roi === 'None' ? 'Not Primary' : roi;
    return (
      <div title={name} style={styles} key={roi}>
        {name}
      </div>
    );
  });
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
          width: '1px',
          height: '10px',
          backgroundColor: color
        };
        return <div key={key} style={divStyles} />;
      })}
      {' 100%'}
    </div>
  );
}

export default function MiniRoiHeatMap({ roiList, roiInfoObject, preTotal, postTotal }) {
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
      inputs*
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
      outputs*
    </div>
  );
  return [text, hmPost, hmPre];
};

MiniRoiHeatMap.propTypes = {
  roiList: PropTypes.arrayOf(PropTypes.string).isRequired,
  roiInfoObject: PropTypes.object.isRequired,
  preTotal: PropTypes.number.isRequired,
  postTotal: PropTypes.number.isRequired
};
