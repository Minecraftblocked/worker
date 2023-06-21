# Worker

Minecraftblocked is an ongoing project dedicated to providing transparency in the Minecraft gaming community. Our worker is a key part of this project and its main task is to interact with the Mojang API and other server list websites to build up a database of known Minecraft servers.

## What does it do?

Minecraftblocked performs two main operations:

1. **Fetching Blocklist from Mojang:** Every 5 minutes, the worker interacts with the Mojang API to retrieve hashes of blocked Minecraft servers. This data allows us to maintain a current view of the servers Mojang has flagged.

2. **Crawling Server Lists:** Every day, the worker crawls various Minecraft server list websites. This process allows us to build up a database of known servers in the Minecraft community.

## How does it work

Once we have our database of known servers, Minecraftblocked checks these servers against the hash list from the Mojang API. This allows us to identify and mark servers that Mojang has blocked, providing valuable information for Minecraft players worldwide.

## Project status

Minecraftblocked is currently a work in progress. We're always looking to improve the accuracy and efficiency of our Express worker, and we welcome feedback and contributions from the community. Please watch this space for updates and changes.

## Current-architecture

Minecraftblocked is currently hosted on Railway.app, leveraging the power of Express and Redis Queue for task handling and scheduling.

Our data is stored on a MySQL Prisma database hosted by PlanetScale, which allows us to efficiently store and manage the records of known Minecraft servers.

**Please note that the architecture is subject to change as the project evolves and new requirements or improvements are identified.**
