import React from 'react';
import { Document, Page }  from 'react-pdf/dist/esm/entry.webpack';


export default function HelpBrainRegion() {
  return (
    <div style={{margin: '1em'}} >
      <Document file="/public/brainregions.pdf">
        <Page pageNumber={1} scale={1.5} renderAnnotationLayer={false}/>
      </Document>
    </div>
  );
}
