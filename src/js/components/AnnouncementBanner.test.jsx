import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import { render } from '../tests/test-utils';
import AnnouncementBanner, { dismissedAnnouncementKey } from './AnnouncementBanner';

const serverInfo = overrides => ({
  IsPublic: true,
  Version: '1.9.3',
  announcement: 'Service maintenance starts tonight.',
  'announcement-id': 'maintenance-1',
  ...overrides
});

describe('AnnouncementBanner', () => {
  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
  });

  it('fetches serverinfo and renders when both announcement fields are non-empty strings', async () => {
    fetch.mockResponseOnce(JSON.stringify(serverInfo()));

    render(<AnnouncementBanner />);

    expect(await screen.findByText('Service maintenance starts tonight.')).not.toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/serverinfo', {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    });
  });

  it.each([
    ['missing announcement', { announcement: undefined }],
    ['empty announcement', { announcement: '' }],
    ['missing announcement id', { 'announcement-id': undefined }],
    ['empty announcement id', { 'announcement-id': '' }],
    ['non-string announcement', { announcement: 7 }],
    ['non-string announcement id', { 'announcement-id': 7 }]
  ])('does not render for %s', async (description, overrides) => {
    fetch.mockResponseOnce(JSON.stringify(serverInfo(overrides)));

    render(<AnnouncementBanner />);
    await act(async () => {});

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('silently ignores a failed serverinfo fetch', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    fetch.mockRejectOnce(new Error('network unavailable'));

    render(<AnnouncementBanner />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    await act(async () => {});

    expect(screen.queryByRole('alert')).toBeNull();
    expect(error).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();

    error.mockRestore();
    warning.mockRestore();
  });

  it('persists dismissal by id and shows a new announcement id', async () => {
    fetch.mockResponseOnce(JSON.stringify(serverInfo()));
    const firstRender = render(<AnnouncementBanner />);

    expect(await screen.findByText('Service maintenance starts tonight.')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss announcement' }));

    expect(screen.queryByRole('alert')).toBeNull();
    expect(localStorage.getItem(dismissedAnnouncementKey('maintenance-1'))).toBe('true');

    firstRender.unmount();
    fetch.mockResponseOnce(JSON.stringify(serverInfo()));
    const secondRender = render(<AnnouncementBanner />);
    await act(async () => {});

    expect(screen.queryByRole('alert')).toBeNull();

    secondRender.unmount();
    fetch.mockResponseOnce(
      JSON.stringify(
        serverInfo({
          announcement: 'Service maintenance has moved.',
          'announcement-id': 'maintenance-2'
        })
      )
    );
    render(<AnnouncementBanner />);

    expect(await screen.findByText('Service maintenance has moved.')).not.toBeNull();
    expect(localStorage.getItem(dismissedAnnouncementKey('maintenance-2'))).toBeNull();
  });
});
