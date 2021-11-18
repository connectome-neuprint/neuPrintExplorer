import { rest } from 'msw';

/* eslint-disable-next-line import/prefer-default-export */
export const handlers = [
  // Handles a POST /login request
  rest.post('/login', (req, res, ctx) => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true')
    return res(
      // Respond with a 200 status code
      ctx.status(200),
    )
  }),

  // Handles a GET /user request
  rest.get('/user', null)
];
