import { rest } from 'msw';
import ngLayers from './ng-layers.json';

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
  rest.get('/api/dbmeta/vimo', (req, res, ctx) =>
    res(ctx.status(200), ctx.json({url: 'http://localhost:4242'}))
  ),
  // Handles a GET /user request
  rest.get('/user', null)
];
