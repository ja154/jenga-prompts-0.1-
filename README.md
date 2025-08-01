# JengaPrompts Pro

This project is a professional toolkit to build, test, and optimize prompts for any AI model. It's built with React, TypeScript, and Vite, and uses the Google Gemini API for prompt enhancement.

## Production-Ready Setup

This application has been structured for production deployment with the following features:

- **Vite Build Tool**: Fast development server with Hot Module Replacement (HMR) and an optimized production build process.
- **TypeScript**: For type safety and better developer experience.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development, configured with PostCSS for production builds.
- **Environment Variable Handling**: Securely manages API keys for production environments.
- **Code Splitting**: Components are lazy-loaded to improve initial page load performance.

## Environment Setup

1.  **API Key**: This project requires a Google Gemini API key. Create a file named `.env.local` in the root of the project and add your API key to it:

    ```
    VITE_API_KEY=your_api_key_here
    ```

    **Note**: The `.env.local` file is included in `.gitignore` to prevent accidentally committing your API key.

## Available Scripts

### `npm install`

Installs all the necessary dependencies to run the application.

### `npm run dev`

Runs the app in development mode with a local server. Open [http://localhost:5173](http://localhost:5173) (or the port specified in your terminal) to view it in your browser. The page will reload when you make changes.

### `npm run build`

Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include hashes.

### `npm run preview`

Serves the production build from the `dist` folder locally. This is a good way to test the final production assets before deploying.
