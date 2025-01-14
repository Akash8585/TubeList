import { useState } from 'react';

const GoogleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);

  const generateHTML = (subscriptions) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Subscriptions</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background: white;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .subscription-list {
            display: grid;
            gap: 15px;
        }
        .channel-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .channel-name {
            font-size: 16px;
            font-weight: 500;
            color: #333;
        }
        .subscribe-button {
            background: #cc0000;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            text-decoration: none;
            transition: background-color 0.2s;
        }
        .subscribe-button:hover {
            background: #990000;
        }
        .timestamp {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .count {
            font-size: 18px;
            color: #333;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>YouTube Subscriptions</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleDateString()}</div>
        <div class="count">Total Subscriptions: ${subscriptions.length}</div>
    </div>
    <div class="subscription-list">
        ${subscriptions.map(channel => `
            <div class="channel-card">
                <div class="channel-name">${channel.title}</div>
                <a href="https://www.youtube.com/channel/${channel.id}?sub_confirmation=1" 
                   class="subscribe-button" 
                   target="_blank">
                    Subscribe
                </a>
            </div>
        `).join('')}
    </div>
</body>
</html>
    `;
  };

  const authenticate = () => {
    if (!chrome || !chrome.runtime?.id) {
      setError('This app must be run as a Chrome extension');
      return;
    }

    const manifest = chrome.runtime.getManifest();
    const clientId = manifest.oauth2.client_id;
    const redirectUri = chrome.identity.getRedirectURL();
    const scopes = manifest.oauth2.scopes.join(' ');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scopes);

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true
      },
      async (redirectUrl) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message);
          return;
        }

        if (redirectUrl) {
          const params = new URLSearchParams(new URL(redirectUrl).hash.slice(1));
          const accessToken = params.get('access_token');
          if (accessToken) {
            setIsAuthenticated(true);
            await fetchSubscriptions(accessToken);
          }
        }
      }
    );
  };

  const fetchSubscriptions = async (accessToken) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let allSubscriptions = [];
      let nextPageToken = '';
      
      do {
        const url = new URL('https://www.googleapis.com/youtube/v3/subscriptions');
        url.searchParams.append('part', 'snippet');
        url.searchParams.append('mine', 'true');
        url.searchParams.append('maxResults', '50');
        if (nextPageToken) {
          url.searchParams.append('pageToken', nextPageToken);
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        allSubscriptions = [...allSubscriptions, ...data.items.map(sub => ({
          id: sub.snippet.resourceId.channelId,
          title: sub.snippet.title
        }))];

        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      setSubscriptionCount(allSubscriptions.length);
      setSubscriptionData(allSubscriptions);

    } catch (error) {
      setError(`Error fetching subscriptions: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSubscriptionsHTML = () => {
    try {
      const html = generateHTML(subscriptionData);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `youtube-subscriptions-${timestamp}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 2000);
    } catch (err) {
      setError('Failed to download subscriptions');
      console.error('HTML generation error:', err);
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setSubscriptionData(null);
    setError(null);
    setIsDownloaded(false);
    setSubscriptionCount(0);
  };

  return (
    <div className="auth-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {!isAuthenticated ? (
        <button onClick={authenticate} className="auth-button">
          Sign in with Google
        </button>
      ) : (
        <div className="authenticated-content">
          <div className="header-actions">
            <h2>Export Your Subscriptions</h2>
            <button onClick={signOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
          
          {isLoading ? (
            <div className="loading">
              <p>Fetching your subscriptions...</p>
              <p className="loading-subtext">This might take a moment if you have many subscriptions</p>
            </div>
          ) : subscriptionData ? (
            <div className="download-section">
              <p className="success-text">Your subscriptions list is ready! ({subscriptionCount} channels)</p>
              <button 
                onClick={downloadSubscriptionsHTML}
                className="download-button"
              >
                {isDownloaded ? 'Downloaded!' : 'Download Subscriptions (HTML)'}
              </button>
              <p className="help-text">
                This will download an HTML file with your subscriptions and subscribe buttons
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;