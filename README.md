# SELLOUT: The Blockchain Artist

This project allows users to purchase digital art on the blockchain. The artworks are digital images created entirely by software listening for art purchase events. The art is priced by the pixel and stored on IPFS for the purchaser to download.

Conceptually this project plays with ideas of what is art, how is it commodified, how we value algorithmically generated art.

There are three actors:
* The Patron (user) commissions an artwork from the Agent
* The Agent (smart contract) creates a Commission smart contract detailing the art to be created
* The Artist (NodeJS server) creates a work to fulfill the commission

## How to run the project

On separate command lines run:
1. `npm run eth` This starts a local Ethereum node. This runs ganache-cli with a preconfigured mneumonic. It's important to use this setting so the artist address matches what is hard-coded into the Node server. Note the addresses created. The agent owner is the first and the artist is the last. Ideally use one of the other addresses when interacting with the system (below).
2. `truffle migrate` This compiles and migrates the contracts to the local network.
3. `npm install` and `npm run start` This starts a React development server to serve the web frontend for the system.
4. `cd server`, `npm install` and `npm run start` This starts the Artist web server that listens for commisions and creates art.

Once these processes are all running, open a web browser to `localhost:3000` to interact with the application:
1. Log in to MetaMask in the browser.
2. Commission an artwork by entering a width and height and clicking `Commission Artwork`

Once the commission is created it will appear below. Once the artwork is created a link will appear to view it on IPFS. If for some reason the artist fails to create the artwork before the commission expires, then the user may request a refund.