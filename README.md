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

3. Copy and rename the `.env.example` file to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
4. Add your Mapbox API key to the `.env` file:

   ```
   MAPBOX_TOKEN=your_mapbox_api_key_here
   ```

   You can get a free API key from [Mapbox](https://www.mapbox.com/).

5. Copy and rename the `example.sftp.json` file to `sftp.json` in the `.vscode` folder:
   ```bash
   cp .vscode/example.sftp.json .vscode/sftp.json
   ```
   - Update your UQ username in the `sftp.json` file (Example: `s9999999`)

# 🛠️ Development Workflow

## Running the Project Locally

1. Build the TypeScript code:

   ```bash
   npm run build
   ```

   This will compile the TypeScript files from `client/ts/` into JavaScript in the `client/js/` directory.

2. For active development with automatic rebuilding when files change:

   ```bash
   npm run watch
   ```

3. Open `client/index.html` in your browser to view the project.

## Deploying to the Server

After making changes and building the project:

### Using VS Code SFTP extension

1. Build the project:

   ```bash
   npm run build
   ```

2. Make sure you've configured your `sftp.json` file as described in the Installation section.

3. Right-click on the `client` folder in VS Code.

4. Select "SFTP: Upload" to upload all files to the server.
   - This will automatically exclude the TypeScript source files as configured in `sftp.json`.

### Manual SFTP Upload

1. Build the project:

   ```bash
   npm run build
   ```

2. Use an SFTP client (like FileZilla) to upload the contents of the `client` directory to the server:
   - Host: `deco7180teams-vikings.uqcloud.net`
   - Username: Your UQ username
   - Password: Your UQ password
   - Remote directory: `/var/www/htdocs/`

# Accessing the server

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
