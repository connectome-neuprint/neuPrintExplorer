import { rest } from 'msw';
import ngLayers from './ng-layers.json';
import datasets from './datasets.json';
import findNeurons from './find-neurons.json';
import columnRequest from './column-request.json';

const base64Image =
  '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';

/* eslint-disable-next-line import/prefer-default-export */
export const handlers = [
  // Handles a POST /login request
  rest.post('/login', (req, res, ctx) => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true');
    return res(
      // Respond with a 200 status code
      ctx.status(200)
    );
  }),
  rest.get('/api/npexplorer/nglayers/vnc.json', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(ngLayers))
  ),

  rest.get('/profile', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({"ImageURL":"/mock-image","Email":"test@test.com","AuthLevel":"admin"}));
  }),


  rest.get('/mock-image', (req, res, ctx) => {
    const binary = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    const blob = new Blob([binary], { type: 'image/png' });
    return res(
      ctx.set('Content-Type', 'image/png'),
      ctx.body(blob)
    );
  }),

  rest.get('/api/dbmeta/datasets', async (req, res, ctx) => {
    // Get original response or use mock datasets
    let datasetsData;
    try {
      const originalResponse = await ctx.fetch(req);
      datasetsData = await originalResponse.json();
    } catch {
      datasetsData = datasets;
    }

    // Add logo and description to all datasets
    const enhancedDatasets = {};
    Object.keys(datasetsData).forEach(datasetKey => {
      enhancedDatasets[datasetKey] = {
        ...datasetsData[datasetKey],
        logo: '/mock-image',
        description: `**${datasetKey}** dataset containing reconstructed neurons and connectivity data.\n\nThis dataset includes:\n- Detailed neuron reconstructions\n- Synaptic connectivity\n- Region of interest (ROI) annotations\n\nFor more information, visit our [documentation](https://neuprint.janelia.org/)\n\n[information][info].`
      };
      // Set default and hidden datasets to test default setting works
      if (datasetKey === 'vnc') {
        enhancedDatasets[datasetKey].default = true;
      }
      if (datasetKey === 'cns') {
        enhancedDatasets[datasetKey].default = true;
        enhancedDatasets[datasetKey].hidden = true;
      }
    });

    return res(ctx.status(200), ctx.json(enhancedDatasets));
  }),

  // Handles a GET /user request
  rest.get('/user', null),
  // uncomment this to test or modify the find neurons response.
  /* rest.post('/api/custom/custom', async (req, res, ctx) => {
		const npExplorer = req.url.searchParams.get('np_explorer');

		if (npExplorer === 'find_neurons') {
			return res(ctx.status(200), ctx.json(findNeurons))
		}
		const originalResponse = await ctx.fetch(req);
		return res(ctx.status(originalResponse.status), ctx.json(await originalResponse.json()));
  }), */
  /* rest.post('/api/custom/custom', async (req, res, ctx) => {
		const npExplorer = req.url.searchParams.get('np_explorer');

		if (npExplorer === 'column_request') {
			return res(ctx.status(200), ctx.json(columnRequest))
		}
		const originalResponse = await ctx.fetch(req);
		return res(ctx.status(originalResponse.status), ctx.json(await originalResponse.json()));
  })*/


];
