// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages from MAL content script
  if (message.action === 'malCoverDownloaded') {
    // Log the download event
    console.log('MAL cover downloaded:', message.title);

    // Relay message to all extension contexts (no need to catch, it doesn't return a promise)
    chrome.runtime.sendMessage(message);

    sendResponse({ success: true });
    return true;
  }

  // Handle createTracker messages from content script
  if (message.action === 'createTracker') {
    try {
      console.log('Received createTracker message:', message.trackerData);

      // Get auth token from storage
      chrome.storage.local.get('authToken', async (result) => {
        try {
          const token = result.authToken;
          if (!token) {
            console.error('No auth token found');
            sendResponse({ success: false, error: 'Not authenticated. Please log in first.' });
            return;
          }

          // Make direct API call
          const apiUrl = process.env.API_URL || 'http://localhost:5050';
          const response = await fetch(`${apiUrl}/media-trackers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(message.trackerData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error:', response.status, errorText);
            sendResponse({
              success: false,
              error: `API error: ${response.status} ${errorText}`,
            });
            return;
          }

          const data = await response.json();
          console.log('Tracker created:', data);
          sendResponse({ success: true, data });
        } catch (error) {
          console.error('Error creating tracker:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      // Return true to indicate we'll use sendResponse asynchronously
      return true;
    } catch (error) {
      console.error('Error in createTracker handler:', error);
      sendResponse({ success: false, error: 'Internal error' });
      return true;
    }
  }
});

// Add an empty export to make this file a module
export {};
