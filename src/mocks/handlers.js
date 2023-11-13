import { rest } from 'msw';
import ngLayers from './ng-layers.json';
import findNeurons from './find-neurons.json';

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
];
