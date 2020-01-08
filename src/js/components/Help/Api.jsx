import React, { useEffect } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

function HelpApi() {
  useEffect(() => {
    SwaggerUi({
      dom_id: '#swaggerContainer',
      url: '/api/help/swagger.yaml',
      presets: [presets.apis]
    });
  }, []);

  return (
    <div style={{ padding: 8 * 3, width: '100%' }}>
      <div id="swaggerContainer" />
    </div>
  );
}

export default HelpApi;
