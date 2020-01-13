import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
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
      <Typography>
        Documentation for accessing neuPrint through python is available at{' '}
        <a href="https://github.com/connectome-neuprint/neuprint-python">neuprint-python</a>
      </Typography>
      <div id="swaggerContainer" />
    </div>
  );
}

export default HelpApi;
