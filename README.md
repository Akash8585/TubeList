# Tube List

Tube List is a Chrome extension that allows users to authenticate with Google, fetch their YouTube subscriptions, and download them as an HTML file with subscribe buttons.

## Features

- Google OAuth2 authentication
- Fetch YouTube subscriptions
- Download subscriptions as an HTML file

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Akash8585/TubeList.git
   ```

2. Navigate to the project directory:
   ```bash
   cd tubelist
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## Usage

- Click the extension icon to open the popup.
- 
![image](https://github.com/user-attachments/assets/5d230443-dc97-4f98-8c56-a7d02e4e196e)

- Sign in with Google to fetch your YouTube subscriptions.
- 
![image](https://github.com/user-attachments/assets/c230d764-f513-435d-b11d-67dc711cf565)

- Download your subscriptions as an HTML file.
- 
![image](https://github.com/user-attachments/assets/fc87d0b4-2460-42fd-bdd4-3d69e00fd0b0)


## Code Overview

### Main Components

- **GoogleAuth Component**: Handles authentication and fetching subscriptions.
  ```javascript:TubeList/src/components/GoogleAuth.jsx
  startLine: 3
  endLine: 267
  ```

- **App Component**: Main application component.
  ```javascript:TubeList/src/App.jsx
  startLine: 2
  endLine: 23
  ```

### Configuration

- **Manifest File**: Chrome extension configuration.
  ```json:TubeList/public/manifest.json
  startLine: 1
  endLine: 24
  ```

## License

This project is licensed under the MIT License.
