# 🔥 Heatmap

This is a project in the course DECO7180 at the University of Queensland. The project is a heatmap that visualises traffic infringements in Australia.

The project is run at [deco7180teams-vikings.uqcloud.net](https://deco7180teams-vikings.uqcloud.net)

![](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWhzamVweWlhN25vYXIxemsyMjY2YzZsaXd1YXZmMGRleGFlamNrZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5nsiFjdgylfK3csZ5T/giphy.gif)
![](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeml4a3o4NnNodjJzZTl5ODBlcG1zNzM4ZDhjZXJuZHJ1cm51NnJ5bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NBfbMVZnUqN2ZtSQUN/giphy.gif)

# 🧑‍🧑‍🧒‍🧒 Contributors

| Full Name              | Email                                                                     |
| ---------------------- | ------------------------------------------------------------------------- |
| Magnus Byrkjeland      | [m.byrkjeland@student.uqu.edu.au](mailto:m.byrkjeland@student.uqu.edu.au) |
| Just Lund Broch        | [m.byrkjeland@student.uqu.edu.au](mailto:m.byrkjeland@student.uqu.edu.au) |
| Elisabeth Caspersen    | [m.byrkjeland@student.uqu.edu.au](mailto:m.byrkjeland@student.uqu.edu.au) |
| Thea Slemdal Bergersen | [m.byrkjeland@student.uqu.edu.au](mailto:m.byrkjeland@student.uqu.edu.au) |

# 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/sleipner01/DECO7180.git
   cd DECO7180
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   For development:

   ```bash
   cp .env.development.example .env.development
   ```

   For production:

   ```bash
   cp .env.production.example .env.production
   ```

4. Update the environment files with your Mapbox API key:

   ```
   MAPBOX_TOKEN=your_mapbox_api_key_here
   DEBUG=true  # or false for production
   ENV=development  # or production
   ```

   You can get a free API key from [Mapbox](https://www.mapbox.com/).

5. Copy and rename the `example.sftp.json` file to `sftp.json` in the `.vscode` folder:
   ```bash
   cp .vscode/example.sftp.json .vscode/sftp.json
   ```
   - Update your UQ username in the `sftp.json` file (Example: `s9999999`)

# 🛠️ Development Workflow

## Running the Project Locally

The project has different build commands depending on your environment:

1. Development build (includes source maps and debugging):

   ```bash
   npm run build:dev
   ```

   This will compile the TypeScript files using the `.env.development` configuration.

2. Production build (optimized for deployment):

   ```bash
   npm run build
   ```

   This will compile the TypeScript files using the `.env.production` configuration.

3. For active development with automatic rebuilding when files change:

   ```bash
   npm run watch
   ```

   This uses the development environment and will automatically rebuild when files change.

4. Open `client/index.html` in your browser to view the project.

## Environment Management

The project uses separate environment files for development and production:

- `.env.development` - Contains development-specific settings
- `.env.production` - Contains production-specific settings

Both files support the following variables:

```
MAPBOX_TOKEN=your_mapbox_token_here
DEBUG=true|false
ENV=development|production
```

## Deploying to the Server 🚀🚀

After making changes and building the project:

### Using VS Code SFTP extension

1. Build the project with the production environment:

   ```bash
   npm run build
   ```

2. Make sure you've configured your `sftp.json` file as described in the Installation section.

3. Right-click on the `client` folder in VS Code.

4. Select "SFTP: Upload" to upload all files to the server.
   - This will automatically exclude the TypeScript source files as configured in `sftp.json`.

### Manual SFTP Upload

1. Build the project with the production environment:

   ```bash
   npm run build
   ```

2. Use an SFTP client (like FileZilla) to upload the contents of the `client` directory to the server:
   - Host: `deco7180teams-vikings.uqcloud.net`
   - Username: Your UQ username
   - Password: Your UQ password
   - Remote directory: `/var/www/htdocs/`

# ⚙️ Accessing the server

**SFTP**

- The server is running on `deco7180teams-vikings.uqcloud.net`.
- You can access the server using SFTP with the following credentials:
  - Host: `deco7180teams-vikings.uqcloud.net`
  - Username: `s9999999` (replace with your own username)
  - Password: `uqpassword` (replace with your own password)

**SSH**

- You can access the server using SSH via the command line with the following command:
  ```bash
  ssh s9999999@deco7180teams-vikings.uqcloud.net
  ```
- You will be prompted for your password.

# 🏗️ Tech Stack

| Technology     | Description                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| HTML           | Structure of the web application                                                                |
| CSS            | Styling for the web application                                                                 |
| TypeScript     | Strongly typed programming language that builds on JavaScript                                   |
| Webpack        | Module bundler to compile TypeScript and manage dependencies                                    |
| MapBox GL JS   | A JavaScript library for interactive maps. [See more information here.](https://www.mapbox.com) |
| PapaParse      | CSV parsing library for handling data files                                                     |
| dotenv-webpack | Plugin to use environment variables in the web application                                      |

# 🌳 Project Structure

```
.
├── .env.development             # Development environment variables
├── .env.example                 # Example environment variables file
├── .env.production              # Production environment variables
├── .gitignore                   # Git ignore file
├── package.json                 # NPM package configuration
├── README.md                    # Project documentation (this file)
├── tsconfig.json                # TypeScript configuration
├── webpack.config.js            # Webpack build configuration
├── .vscode/                     # VS Code configuration
│   ├── example.sftp.json        # Template for SFTP configuration
│   └── sftp.json                # Actual SFTP configuration (gitignored)
└── client/                      # Client-side code (deployed to server)
    ├── index.html               # Main HTML page
    ├── css/                     # CSS stylesheets
    │   └── styles.css           # Main stylesheet
    ├── data/                    # Data files
    │   ├── data.csv             # CSV data for heatmap (if used)
    │   └── data.json            # JSON data for heatmap
    ├── js/                      # Compiled JavaScript (output of build)
    │   ├── script.js            # Compiled main script
    │   └── script.js.LICENSE.txt # License information for dependencies
    ├── media/                   # Media assets
    │   └── vikings.jpeg         # Team logo/image
    └── ts/                      # TypeScript source code
        ├── env.ts               # Environment variables access
        ├── script.ts            # Main application entry point
        ├── types.ts             # Type definitions
        ├── services/            # Service modules
        │   ├── dataService.ts   # Data fetching and processing
        │   └── mapService.ts    # Map initialization and management
        └── utils/               # Utility modules
            ├── accessibility.ts # Accessibility helpers
            ├── cache.ts         # Data caching implementation
            └── convert.ts       # Data conversion utilities
```

## Key Components 🗝️

- **Entry Point**: [`client/ts/script.ts`](client/ts/script.ts) - Main application that initializes all components
- **Map Handling**: [`client/ts/services/mapService.ts`](client/ts/services/mapService.ts) - Manages the MapBox integration
- **Data Processing**: [`client/ts/services/dataService.ts`](client/ts/services/dataService.ts) - Handles data loading and processing
- **Caching**: [`client/ts/utils/cache.ts`](client/ts/utils/cache.ts) - Implements localStorage caching for performance
- **Type Definitions**: [`client/ts/types.ts`](client/ts/types.ts) - Contains TypeScript interfaces for the project
- **Environment Config**: [`client/ts/env.ts`](client/ts/env.ts) - Makes environment variables available to the application
- **Build System**: [`webpack.config.js`](webpack.config.js) - Configures how the TypeScript code is compiled

## Build Process 🖨️

1. TypeScript files in `client/ts/` are processed through TypeScript compiler
2. Webpack bundles the compiled JavaScript and dependencies
3. The resulting bundle is output to `client/js/script.js`
4. Environment variables from `.env.development` or `.env.production` are injected during build

## Deployment Structure 🪜

When deployed, only the `client` directory contents are uploaded to the server at `/var/www/htdocs/`.
