import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const DISMISSED_ANNOUNCEMENT_PREFIX = 'neuprint-announcement-dismissed:';

export const dismissedAnnouncementKey = announcementId =>
  `${DISMISSED_ANNOUNCEMENT_PREFIX}${announcementId}`;

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch('/api/serverinfo', {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(response => (response.ok ? response.json() : null))
      .then(serverInfo => {
        if (!mounted || !serverInfo) {
          return;
        }

        const message = serverInfo.announcement;
        const announcementId = serverInfo['announcement-id'];
        if (!isNonEmptyString(message) || !isNonEmptyString(announcementId)) {
          return;
        }

        let dismissed = false;
        try {
          dismissed = localStorage.getItem(dismissedAnnouncementKey(announcementId)) === 'true';
        } catch {
          // localStorage can be disabled; showing the announcement is the safe fallback.
        }

        if (!dismissed) {
          setAnnouncement({ id: announcementId, message });
        }
      })
      .catch(() => {
        // Announcements are optional and must never interfere with loading the app.
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!announcement) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(dismissedAnnouncementKey(announcement.id), 'true');
    } catch {
      // Hide for this page view even when persistence is unavailable.
    }
    setAnnouncement(null);
  };

  return (
    <Alert
      severity="info"
      variant="filled"
      sx={{ borderRadius: 0, flexShrink: 0 }}
      action={
        <IconButton
          aria-label="Dismiss announcement"
          color="inherit"
          onClick={dismiss}
          size="small"
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
    >
      {announcement.message}
    </Alert>
  );
}

export default AnnouncementBanner;
