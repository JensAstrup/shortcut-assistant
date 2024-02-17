# Shortcut Assistant
[![Tests](https://github.com/JensAstrup/shortcut-assistant/actions/workflows/tests.js.yml/badge.svg?branch=main)](https://github.com/JensAstrup/shortcut-assistant/actions/workflows/tests.js.yml)

Shortcut Assistant is a Chrome extension that adds various additional features to Shortcut.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Google Chrome or Arc Browser

### Installing

1. **Clone the Repository**

2. **Install Dependencies**

   ```bash
   cd src
   npm install
   ```

3. **Set up Environment Variables**

   ```bash
    cp .env.example .env
    ```
    - `VERSION` - The version of the extension.
    - `SENTRY_AUTH_TOKEN` - The Sentry auth token for the project.
    - `SENTRY_RELEASE` - This should be the same as the `VERSION` variable.
    - `GOOGLE_ANALYTICS_API_SECRET` - A Google Analytics API secret. 
    - `GOOGLE_MEASUREMENT_ID` - The Google Measurement ID for the project.
    - `PROXY_URL` - The URL of the proxy server for OpenAI's API

### Running the Extension Locally

1. Open Google Chrome and navigate to `chrome://extensions/`.

2. Enable 'Developer mode' in the top right corner.

3. Click on 'Load unpacked' and select the `src` folder within your project directory.

4. The extension should now be visible in the extensions list and active in the Chrome browser.

## Development Workflow

- Run `npm run dev`.
- Make changes to the source files.
- Reload the extension from `chrome://extensions/` by clicking the 'Reload' button under the extension.

## Packaging the Extension for Distribution

1. **Build the Project**
   ```bash
   npm run build
   npx webpack
   ```
2. In the root project directory, zip the `src` folder.
   ```
   zip -r dist/dist.zip src
   ```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](/tags).

## Authors

- **Jens Astrup** - [JensAstrup](https://github.com/JensAstrup)

## License

This project is licensed under [CC BY-NC 4.0 Deed | Attribution-NonCommercial 4.0 International Creative Commons](https://creativecommons.org/licenses/by-nc/4.0/deed.en)

## Acknowledgments

- ChatGPT