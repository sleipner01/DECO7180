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
   git clone
   ```
2. Copy and rename the `example.sftp.json` file to `sftp.json` in the `.vscode` folder.
   - The `example.sftp.json` file contains the configuration for the SFTP connection to the server.
   - The `sftp.json` file is used by Visual Studio Code to connect to the server, and is not tracked by Git.
3. Insert your username in the `sftp.json` file (Example: `s9999999`)

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

| Technology | Description                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------- |
| HTML       |                                                                                                 |
| CSS        |                                                                                                 |
| JavaScript |                                                                                                 |
| MapBox     | A JavaScript library for interactive maps. [See more information here.](https://www.mapbox.com) |
