// Description: Code to convert neuroglancer state objects to and from url safe strings
// Usage: bun convert.ts


const SINGLE_QUOTE_STRING_PATTERN = /('(?:[^'\\]|(?:\\.))*')/;
const DOUBLE_QUOTE_STRING_PATTERN = /("(?:[^"\\]|(?:\\.))*")/;
const SINGLE_OR_DOUBLE_QUOTE_STRING_PATTERN =
    new RegExp(`${SINGLE_QUOTE_STRING_PATTERN.source}|${DOUBLE_QUOTE_STRING_PATTERN.source}`);
const DOUBLE_OR_SINGLE_QUOTE_STRING_PATTERN =
    new RegExp(`${DOUBLE_QUOTE_STRING_PATTERN.source}|${SINGLE_QUOTE_STRING_PATTERN.source}`);

const DOUBLE_QUOTE_PATTERN = /^((?:[^"'\\]|(?:\\[^']))*)("|\\')/;
const SINGLE_QUOTE_PATTERN = /^((?:[^"'\\]|(?:\\.))*)'/;

function convertStringLiteral(
  x: string, quoteInitial: string, quoteReplace: string, quoteSearch: RegExp) {
  if (x.length >= 2 && x.charAt(0) === quoteInitial && x.charAt(x.length - 1) === quoteInitial) {
    let inner = x.substr(1, x.length - 2);
    let s = quoteReplace;
    while (inner.length > 0) {
      const m = inner.match(quoteSearch);
      if (m === null) {
        s += inner;
        break;
      }
      s += m[1];
      if (m[2] === quoteReplace) {
        // We received a single unescaped quoteReplace character.
        s += '\\';
        s += quoteReplace;
      } else {
        // We received "\\" + quoteInitial.  We need to remove the escaping.
        s += quoteInitial;
      }
      inner = inner.substr(m.index! + m[0].length);
    }
    s += quoteReplace;
    return s;
  }
  return x;
}

function convertJsonHelper(x: string, desiredCommaChar: string, desiredQuoteChar: string) {
  const commaSearch = /[&_,]/g;
  let quoteInitial: string;
  let quoteSearch: RegExp;
  let stringLiteralPattern: RegExp;
  if (desiredQuoteChar === '"') {
    quoteInitial = '\'';
    quoteSearch = DOUBLE_QUOTE_PATTERN;
    stringLiteralPattern = SINGLE_OR_DOUBLE_QUOTE_STRING_PATTERN;
  } else {
    quoteInitial = '"';
    quoteSearch = SINGLE_QUOTE_PATTERN;
    stringLiteralPattern = DOUBLE_OR_SINGLE_QUOTE_STRING_PATTERN;
  }
  let s = '';
  while (x.length > 0) {
    const m = x.match(stringLiteralPattern);
    let before: string;
    let replacement: string;
    if (m === null) {
      before = x;
      x = '';
      replacement = '';
    } else {
      before = x.substr(0, m.index);
      x = x.substr(m.index! + m[0].length);
      const originalString = m[1];
      if (originalString !== undefined) {
        replacement =
            convertStringLiteral(originalString, quoteInitial, desiredQuoteChar, quoteSearch);
      } else {
        replacement = m[2];
      }
    }
    s += before.replace(commaSearch, desiredCommaChar);
    s += replacement;
  }
  return s;
}

function urlSafeToJSON(x: string) {
  return convertJsonHelper(x, ',', '"');
}

function urlSafeParse(x: string) {
  return JSON.parse(urlSafeToJSON(x));
}



const encoded = '%7B%22dimensions%22:%7B%22x%22:%5B8e-9%2C%22m%22%5D%2C%22y%22:%5B8e-9%2C%22m%22%5D%2C%22z%22:%5B8e-9%2C%22m%22%5D%7D%2C%22position%22:%5B17213.5%2C19862.5%2C20697.5%5D%2C%22crossSectionScale%22:1%2C%22projectionScale%22:65535.999999999985%2C%22layers%22:%5B%7B%22type%22:%22image%22%2C%22source%22:%22precomputed://gs://neuroglancer-janelia-flyem-hemibrain/emdata/clahe_yz/jpeg%22%2C%22tab%22:%22source%22%2C%22name%22:%22hemibrain:v1.2.1-grayscalejpeg%22%7D%2C%7B%22type%22:%22segmentation%22%2C%22source%22:%22precomputed://gs://neuroglancer-janelia-flyem-hemibrain/v1.2/segmentation%22%2C%22tab%22:%22source%22%2C%22segments%22:%5B%22734814622%22%2C%22769263962%22%5D%2C%22name%22:%22hemibrain:v1.2.1%22%7D%2C%7B%22type%22:%22annotation%22%2C%22source%22:%22dvid://https://hemibrain-dvid.janelia.org/3159/public_annotations?usertag=true&auth=https://hemibrain-dvid.janelia.org/api/server/token%22%2C%22tool%22:%22annotatePoint%22%2C%22tab%22:%22source%22%2C%22annotationColor%22:%22#ff0000%22%2C%22shader%22:%22#uicontrol%20vec3%20falseSplitColor%20color%28default=%5C%22#F08040%5C%22%29%5Cn#uicontrol%20vec3%20falseMergeColor%20color%28default=%5C%22#F040F0%5C%22%29%5Cn#uicontrol%20vec3%20checkedColor%20color%28default=%5C%22green%5C%22%29%5Cn#uicontrol%20vec3%20borderColor%20color%28default=%5C%22black%5C%22%29%5Cn%5Cn#uicontrol%20float%20radius%20slider%28min=3%2C%20max=20%2C%20step=1%2C%20default=10%29%5Cn#uicontrol%20float%20opacity%20slider%28min=0%2C%20max=1%2C%20step=0.1%2C%20default=1%29%20%20%5Cn%5Cnvoid%20main%28%29%20%7B%5Cn%20%20setPointMarkerSize%28radius%29%3B%5Cn%20%20float%20finalOpacity%20=%20PROJECTION_VIEW%20?%20opacity%20%2A%200.2%20:%20opacity%3B%5Cn%5Cn%20%20setPointMarkerBorderColor%28vec4%28borderColor%2C%20finalOpacity%29%29%3B%5Cn%20%20if%20%28prop_rendering_attribute%28%29%20==%201%29%20%7B%5Cn%20%20%20%20setColor%28vec4%28checkedColor%2C%20finalOpacity%29%29%3B%5Cn%20%20%7D%20else%20if%20%28prop_rendering_attribute%28%29%20==%202%29%20%7B%20%20%20%20%5Cn%20%20%20%20setColor%28vec4%28falseSplitColor%2C%20finalOpacity%29%29%3B%5Cn%20%20%7D%20else%20if%20%28prop_rendering_attribute%28%29%20==%203%29%20%20%7B%5Cn%20%20%20%20setColor%28vec4%28falseMergeColor%2C%20finalOpacity%29%29%3B%5Cn%20%20%7D%20else%20%7B%5Cn%20setColor%28vec4%281%2C%200%2C%200%2C%20finalOpacity%29%29%3B%5Cn%20%20%7D%5Cn%7D%22%2C%22name%22:%22hemibrain:v1.2.1-public_annotations%22%7D%2C%7B%22type%22:%22annotation%22%2C%22source%22:%22precomputed://gs://neuroglancer-janelia-flyem-hemibrain/v1.2/synapses%22%2C%22tab%22:%22source%22%2C%22shader%22:%22#uicontrol%20vec3%20preColor%20color%28default=%5C%22yellow%5C%22%29%5Cn#uicontrol%20vec3%20postColor%20color%28default=%5C%22gray%5C%22%29%5Cn#uicontrol%20float%20preConfidence%20slider%28min=0%2C%20max=1%2C%20default=0%29%5Cn#uicontrol%20float%20postConfidence%20slider%28min=0%2C%20max=1%2C%20default=0%29%5Cn#uicontrol%20float%20sliceViewOpacity%20slider%28min=0%2C%20max=1%2C%20default=0.5%29%5Cn#uicontrol%20float%20projectionViewOpacity%20slider%28min=0%2C%20max=1%2C%20default=0.3%29%5Cn%5Cnvoid%20main%28%29%20%7B%5Cn%20%20float%20opacity%20=%20PROJECTION_VIEW%20?%20projectionViewOpacity%20:%20sliceViewOpacity%3B%5Cn%20%20setColor%28vec4%28defaultColor%28%29%2C%20opacity%29%29%3B%5Cn%20%20setEndpointMarkerColor%28%5Cn%20%20%20%20vec4%28preColor%2C%20opacity%29%2C%5Cn%20%20%20%20vec4%28postColor%2C%20opacity%29%29%3B%5Cn%20%20setEndpointMarkerBorderColor%28%5Cn%20%20%20%20vec4%280%2C%200%2C%200%2C%20opacity%29%2C%5Cn%20%20%20%20vec4%280%2C%200%2C%200%2C%20%20%20%20%20opacity%29%5Cn%20%20%29%3B%5Cn%5Cn%20%20setEndpointMarkerSize%285.0%2C%205.0%29%3B%5Cn%20%20setLineWidth%282.0%29%3B%5Cn%20%20if%20%28prop_pre_synaptic_confidence%28%29%3C%20preConfidence%20%7C%7C%5Cn%20%20prop_post_synaptic_confidence%28%29%3C%20postConfidence%29%20discard%3B%5Cn%7D%5Cn%22%2C%22linkedSegmentationLayer%22:%7B%22pre_synaptic_cell%22:%22hemibrain:v1.2.1%22%2C%22post_synaptic_cell%22:%22hemibrain:v1.2.1%22%7D%2C%22filterBySegmentation%22:%5B%22post_synaptic_cell%22%2C%22pre_synaptic_cell%22%5D%2C%22name%22:%22hemibrain:v1.2.1-synapses%22%7D%5D%2C%22layout%22:%22xy-3d%22%7D'

const decoded = decodeURIComponent(encoded)
const state = urlSafeParse(decoded)


console.log(state)

const raw = {
  "dimensions": {
    "x": [
      8e-9,
      "m"
    ],
    "y": [
      8e-9,
      "m"
    ],
    "z": [
      8e-9,
      "m"
    ]
  },
  "position": [
    17213.5,
    19862.5,
    20697.5
  ],
  "crossSectionScale": 1,
  "projectionScale": 65535.999999999985,
  "layers": [
    {
      "type": "image",
      "source": "precomputed://gs://neuroglancer-janelia-flyem-hemibrain/emdata/clahe_yz/jpeg",
      "tab": "source",
      "name": "hemibrain:v1.2.1-grayscalejpeg"
    },
    {
      "type": "segmentation",
      "source": "precomputed://gs://neuroglancer-janelia-flyem-hemibrain/v1.2/segmentation",
      "tab": "source",
      "segments": [
        "734814622",
        "769263962"
      ],
      "name": "hemibrain:v1.2.1"
    },
    {
      "type": "annotation",
      "source": "dvid://https://hemibrain-dvid.janelia.org/3159/public_annotations?usertag=true&auth=https://hemibrain-dvid.janelia.org/api/server/token",
      "tool": "annotatePoint",
      "tab": "source",
      "annotationColor": "#ff0000",
      "shader": "#uicontrol vec3 falseSplitColor color(default=\"#F08040\")\n#uicontrol vec3 falseMergeColor color(default=\"#F040F0\")\n#uicontrol vec3 checkedColor color(default=\"green\")\n#uicontrol vec3 borderColor color(default=\"black\")\n\n#uicontrol float radius slider(min=3, max=20, step=1, default=10)\n#uicontrol float opacity slider(min=0, max=1, step=0.1, default=1)  \n\nvoid main() {\n  setPointMarkerSize(radius);\n  float finalOpacity = PROJECTION_VIEW ? opacity * 0.2 : opacity;\n\n  setPointMarkerBorderColor(vec4(borderColor, finalOpacity));\n  if (prop_rendering_attribute() == 1) {\n    setColor(vec4(checkedColor, finalOpacity));\n  } else if (prop_rendering_attribute() == 2) {    \n    setColor(vec4(falseSplitColor, finalOpacity));\n  } else if (prop_rendering_attribute() == 3)  {\n    setColor(vec4(falseMergeColor, finalOpacity));\n  } else {\n setColor(vec4(1, 0, 0, finalOpacity));\n  }\n}",
      "name": "hemibrain:v1.2.1-public_annotations"
    },
    {
      "type": "annotation",
      "source": "precomputed://gs://neuroglancer-janelia-flyem-hemibrain/v1.2/synapses",
      "tab": "source",
      "shader": "#uicontrol vec3 preColor color(default=\"yellow\")\n#uicontrol vec3 postColor color(default=\"gray\")\n#uicontrol float preConfidence slider(min=0, max=1, default=0)\n#uicontrol float postConfidence slider(min=0, max=1, default=0)\n#uicontrol float sliceViewOpacity slider(min=0, max=1, default=0.5)\n#uicontrol float projectionViewOpacity slider(min=0, max=1, default=0.3)\n\nvoid main() {\n  float opacity = PROJECTION_VIEW ? projectionViewOpacity : sliceViewOpacity;\n  setColor(vec4(defaultColor(), opacity));\n  setEndpointMarkerColor(\n    vec4(preColor, opacity),\n    vec4(postColor, opacity));\n  setEndpointMarkerBorderColor(\n    vec4(0, 0, 0, opacity),\n    vec4(0, 0, 0,     opacity)\n  );\n\n  setEndpointMarkerSize(5.0, 5.0);\n  setLineWidth(2.0);\n  if (prop_pre_synaptic_confidence()< preConfidence ||\n  prop_post_synaptic_confidence()< postConfidence) discard;\n}\n",
      "linkedSegmentationLayer": {
        "pre_synaptic_cell": "hemibrain:v1.2.1",
        "post_synaptic_cell": "hemibrain:v1.2.1"
      },
      "filterBySegmentation": [
        "post_synaptic_cell",
        "pre_synaptic_cell"
      ],
      "name": "hemibrain:v1.2.1-synapses"
    }
  ],
  "layout": "xy-3d"
};

function encodeFragment(fragment: string) {
  return encodeURI(fragment).replace(/[!'()*;,]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}


const encodedFragment = encodeFragment(JSON.stringify(raw));
console.log(encodedFragment)
