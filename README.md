# Shortcut Assistant

[![codecov](https://codecov.io/gh/JensAstrup/shortcut-assistant/graph/badge.svg?token=BNRO19POX5)](https://codecov.io/gh/JensAstrup/shortcut-assistant)
[![Status Page](https://img.shields.io/website?url=https%3A%2F%2Fstatus.jensastrup.io%2F&label=Status%20Page)](https://status.jensastrup.io/)
[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/kmdlofehocppnlkpokdbiaalcelhedef)](https://chromewebstore.google.com/detail/shortcut-assistant/kmdlofehocppnlkpokdbiaalcelhedef?hl=en&authuser=0)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/kmdlofehocppnlkpokdbiaalcelhedef)](https://chromewebstore.google.com/detail/shortcut-assistant/kmdlofehocppnlkpokdbiaalcelhedef?hl=en&authuser=0)

Shortcut Assistant is a Chrome extension that adds various additional features to Shortcut.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
If you're looking to install the extension, visit the [Chrome Web Store](https://chromewebstore.google.com/detail/shortcut-assistant/kmdlofehocppnlkpokdbiaalcelhedef).
### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Google Chrome or Arc Browser

### Installing

1. **Clone the Repository**

2. **Install Dependencies**

   ```bash
   npm install
   ```
   or
    ```bash
    yarn install
    ```

3. **Set up Environment Variables**

   ```bash
    cp .env.example .env
    ```
    - `VERSION` - The version of the extension.
    - `SENTRY_RELEASE` - This should be the same as the `VERSION` variable.
    - `CHANGELOG_VERSION` - The version the in-app changelog was last updated for.
    - `SENTRY_AUTH_TOKEN` - The Sentry auth token for the project.
    - `GOOGLE_ANALYTICS_API_SECRET` - A Google Analytics API secret. 
    - `GOOGLE_MEASUREMENT_ID` - The Google Measurement ID for the project.
    - `PROXY_URL` - The URL of the proxy server for OpenAI's API
   
Note that some of these variables are missing from the `.env` file in this repository as they are 
included in the GitHub repository secrets.

### Running the Extension Locally

1. Open Google Chrome and navigate to `chrome://extensions/`.

2. Enable 'Developer mode' in the top right corner.

3. Run `npm run dev` to build the extension.

4. Click on 'Load unpacked' and select the `build` folder within your project directory.

5. The extension should now be visible in the extensions list and active in the Chrome browser.

## Development Workflow

- Run `npm run dev`.
- Make changes to the source files.
- Reload the extension from `chrome://extensions/` by clicking the 'Reload' button under the extension.
- Changes to service worker files and the manifest tend to require a full reload of the extension.

## Packaging the Extension for Distribution

1. **Build the Project**
   ```bash
   npm run build
   ```
2. Generate a ZIP file of the `build` folder. `npm run dist` will do this for you.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](/tags).

Standard: `MAJOR.MINOR.PATCH`

**Major**: Breaking changes or significant feature changes

**Minor**: New features

**Patch**: Bug fixes or internal changes not affecting the user experience

To increment the version, update the `VERSION` variable in the `.env` file along with the `SENTRY_RELEASE` variable.
Then run `npm run manifest` to propagate the changes to the `manifest.json` file.

## Authors

- **Jens Astrup** - [JensAstrup](https://github.com/JensAstrup)

## License

This project is licensed under [CC BY-NC 4.0 Deed | Attribution-NonCommercial 4.0 International Creative Commons](https://creativecommons.org/licenses/by-nc/4.0/deed.en)

## Acknowledgments

- ChatGPT
