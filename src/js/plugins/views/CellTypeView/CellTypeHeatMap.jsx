import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const maxColor = '#396a9f';
const squareSize = 30;
const popupHeight = 80;
const popupWidth = 250;

// Converts a hex color to an RGB array.
function hexToRGB(hexColor) {
  // Remove the leading hash character, if it exists.
  const strippedHex = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;

  // Convert the hex color to an RGB array.
  const rgbArray = strippedHex.match(/.{1,2}/g).map((hex) => parseInt(hex, 16));

  // Return the RGB array.
  return rgbArray;
}

// Converts an RGB array to a hex color.
function rgbToHex(rgbArray) {
  // Convert the RGB values to hex strings.
  const hexStrings = rgbArray.map((rgbValue) => rgbValue.toString(16).padStart(2, '0'));

  // Combine the hex strings into a hex color.
  const hexColor = `#${hexStrings.join('')}`;

  // Return the hex color.
  return hexColor;
}

// Blends two colors together, based on a given percentage.
function blendColors(color1, color2, percentage) {
  // Convert the colors to RGB values.
  const rgb1 = hexToRGB(color1);
  const rgb2 = hexToRGB(color2);

  // Calculate the blended RGB values.
  const blendedRGB = [
    Math.round(rgb1[0] * (1 - percentage) + rgb2[0] * percentage),
    Math.round(rgb1[1] * (1 - percentage) + rgb2[1] * percentage),
    Math.round(rgb1[2] * (1 - percentage) + rgb2[2] * percentage),
  ];

  // Convert the blended RGB values back to a hex color.
  const blendedColor = rgbToHex(blendedRGB);

  // Return the blended color.
  return blendedColor;
}

function getHeatmapColor(value, valueRange, color1, color2) {
  // Calculate the percentage of the value within the value range.
  const percentage = (value - valueRange[0]) / (valueRange[1] - valueRange[0]);

  // Blend the two colors based on the percentage.
  const blendedColor = blendColors(color1, color2, percentage);

  // Return the blended color.
  return blendedColor;
}

function usePreviousValue(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const isOutOfViewport = (x, y) => {

    // Check if it's out of the viewport on each side
    const out = {};
    out.top = y < 0;
    out.left = x < 0;
    out.bottom = y + popupHeight + 20 > (window.innerHeight || document.documentElement.clientHeight);
    out.right = x + popupWidth + 20 > (window.innerWidth || document.documentElement.clientWidth);
    out.any = out.top || out.left || out.bottom || out.right;
    out.all = out.top && out.left && out.bottom && out.right;

    return out;

};


export default function CellTypeHeatMap({ data, median, neuronInfo }) {
  const canvasRef = useRef(null);
  const colSize = data.data[0].length;
  const rowSize = data.data.length;
  const highlightEnabled = rowSize * colSize < 6000;

  const [popupVisible, setPopUpVisible] = useState(false);
  const [popupData, setPopUpData] = useState(null);
  const previousPopup = usePreviousValue(popupData);
  const rowHeight = squareSize + 1;
  const colWidth = rowHeight;
  const labelXOffset = 60;
  const labelYOffset = 60;
  const canvasHeight = data.data.length * rowHeight + rowHeight + labelYOffset;
  const canvasWidth = data.data[0].length * colWidth + labelXOffset;
  let maxValue = 0;

  data.data.forEach((row) => {
    row.forEach((column) => {
      // set the maximum observed value that will be used to generate
      // the color range.
      if (column > maxValue) {
        maxValue = column;
      }
    });
  });

  useEffect(() => {
    function colorScale(value) {
      return getHeatmapColor(value, [0, maxValue], '#ffffff', maxColor);
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    // TODO Add the labels to each axis

    for (let row = 0; row < rowSize; row += 1) {
      const y = row * (squareSize + 1) + labelYOffset;
      for (let col = 0; col < colSize; col += 1) {
        const x = col * (squareSize + 1) + labelXOffset;
        context.fillStyle = colorScale(data.data[row][col], row, col);
        context.fillRect(x, y, squareSize, squareSize);
      }
    }

    // set up context to add labels
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillStyle = '#111111';

    // label the y axis
    for (let row = 0; row < rowSize; row += 1) {
      context.fillStyle = !neuronInfo[data.index[row]]?.reference ? '#ef5350' : '#111111';
      // context.fillStyle = '#111111';
      context.fillText(
        data.index[row],
        labelXOffset / 2,
        row * (squareSize + 1) + (squareSize + 1) / 2 + labelXOffset
      );
    }
    // label the x axis
    context.fillStyle = '#111111';
    for (let col = 0; col < colSize; col += 1) {
      context.save();
      context.translate(
        col * (squareSize + 1) + (squareSize + 1) / 2 + labelYOffset,
        labelYOffset / 2
      );
      context.rotate(-45 * Math.PI / 180);
      context.fillText(data.columns[col],0,0);
      context.restore();
    }
    // Add median text values row
    context.fillText(
      'median',
      labelXOffset / 2,
      rowSize * (squareSize + 1) + (squareSize + 1) / 2 + labelYOffset
    );
    for (let col = 0; col < colSize; col += 1) {
      const x = col * (squareSize + 1) + (squareSize + 1) / 2 + labelXOffset;
      const y = rowSize * (squareSize + 1) + (squareSize + 1) / 2 + labelYOffset;
      context.fillText(median.data[col][0], x, y);
    }

    context.stroke();
  }, [data, colSize, rowSize, maxValue, median, neuronInfo]);

  useEffect(() => {
    function colorScale(value) {
      return getHeatmapColor(value, [0, maxValue], '#ffffff', maxColor);
    }

    if (highlightEnabled) {
      if (popupData) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const x = popupData.column * (squareSize + 1) + labelXOffset;
        const y = popupData.row * (squareSize + 1) + labelYOffset;
        context.fillStyle = 'orange';
        context.fillRect(x, y, squareSize, squareSize);
        if (previousPopup) {
          if (popupData.row !== previousPopup.row || popupData.column !== previousPopup.column) {
            const prevX = previousPopup.column * (squareSize + 1) + labelXOffset;
            const prevY = previousPopup.row * (squareSize + 1) + labelYOffset;
            context.fillStyle = colorScale(
              data.data[previousPopup.row][previousPopup.column],
              previousPopup.row,
              previousPopup.column
            );
            context.fillRect(prevX, prevY, squareSize, squareSize);
          }
        }
        context.stroke();
      }
      if (!popupData && previousPopup) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const prevX = previousPopup.column * (squareSize + 1) + labelXOffset;
        const prevY = previousPopup.row * (squareSize + 1) + labelYOffset;
        context.fillStyle = colorScale(
          data.data[previousPopup.row][previousPopup.column],
          previousPopup.row,
          previousPopup.column
        );
        context.fillRect(prevX, prevY, squareSize, squareSize);
        context.stroke();
      }
    }
  }, [popupData, previousPopup, data.data, maxValue, highlightEnabled]);

  const handleMouseMove = (event) => {
    const canvas = event.target;
    const canvasClientRect = canvas.getBoundingClientRect();

    const mouseXRelativeToCanvas = event.clientX - canvasClientRect.left;
    const mouseYRelativeToCanvas = event.clientY - canvasClientRect.top;
    const column = Math.ceil((mouseXRelativeToCanvas - labelXOffset) / (squareSize + 1)) - 1;
    const row = Math.ceil((mouseYRelativeToCanvas - labelYOffset) / (squareSize + 1)) - 1;
    if (row >= 0 && row < rowSize && column >= 0 && column < colSize) {
      const outOfView = isOutOfViewport(event.clientX + 10, event.clientY + 10);
      setPopUpData({
        column,
        row,
        columnName: `${data.columns[column]} (${column})`,
        columnValue: data.data[row][column],
        rowName: data.index[row],
        mouseX: outOfView.right ? event.clientX - (popupWidth + 10) : event.clientX + 10,
        mouseY: outOfView.bottom ? event.clientY - (popupHeight + 10) : event.clientY + 10,
      });
    } else {
      setPopUpData(null);
    }
  };

  return (
    <div
      className="heatmap"
      onMouseEnter={() => {
        setPopUpVisible(true);
      }}
      onMouseLeave={() => {
        setPopUpVisible(false);
        setPopUpData(null);
      }}
    >
      {popupVisible && popupData ? (
        <div
          style={{
            border: '1px solid #ccc',
            background: '#fff',
            padding: '0.1em 1em',
            position: 'fixed',
            width: `${popupWidth}px`,
            height: `${popupHeight}px`,
            top: popupData.mouseY,
            left: popupData.mouseX,
          }}
        >
          <p>
            <b>{popupData.columnName}</b> / {popupData.rowName}
          </p>
          <p>{popupData.columnValue}</p>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        width={canvasWidth}
        height={canvasHeight}
        style={{ width: canvasWidth, height: canvasHeight }}
      />
    </div>
  );
}

CellTypeHeatMap.propTypes = {
  data: PropTypes.object.isRequired,
  median: PropTypes.object.isRequired,
  neuronInfo: PropTypes.object.isRequired,
}
