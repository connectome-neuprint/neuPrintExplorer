import React from 'react';
import { Document, Page }  from 'react-pdf';


export default function CypherExamples() {
  return (
    <div style={{margin: '1em'}} >
      <Document file="/public/cypher_examples.pdf">
        <Page pageNumber={1} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={2} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={3} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={4} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={5} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={6} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={7} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={8} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={9} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={10} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={11} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={12} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={13} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={14} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={15} scale={1.5} renderAnnotationLayer={false} />
        <Page pageNumber={16} scale={1.5} renderAnnotationLayer={false} />
      </Document>
    </div>
  );
}
