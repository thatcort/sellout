# SELLOUT: The Blockchain Artist

This project allows people to commission digital art on the blockchain. The artworks are images created entirely by software "artists" who accept commissions via their "agent". When a commission is made and paid for, the art is created and stored on IPFS for the patron to retreive.

Conceptually this project explores ideas around the nature of algorithmic art within the broader art world and market.

The patron can only specify the size of the artwork in pixel width and height. The artist then fills the canvas however it chooses. For now the artist only draws random dots. Perhaps in the future it will decide to draw something else; perhaps not.

There are three actors:

* The Patron (user) commissions an artwork from the Agent
* The Agent (Ethereum smart contract) creates a Commission smart contract detailing the art to be created
* The Artist (NodeJS server) creates a work to fulfill the commission

How it works:

1. The patron enters the desired size of artwork they wish to commission.
2. When the patron submits their commission request in their Ethereum-enabled browser, they will be prompted to pay the cost of the artwork, plus transaction costs.
3. When the commission is fully paid, the artist will create a custom work of art as specified in the commission.
4. The completed artwork will be stored on IPFS and the address where it is stored will be returned to the patron.
5. All commissions have an expiry time, typically 5 minutes. If for any reason the artist is unable to complete the commission before it expires, the patron may receive a full refund of their payment.


## Installing

Install Truffle-cli globally:

`npm i -g truffle`

Install the client packages:

`cd client`
`npm i`

Install the server packages:

`cd server`
`npm i`

## Running

Run Truffle with the stored configuration:

`cd client`
`npm run eth`

Compile and deploy the Ethereum contracts:

`truffle compile`
`truffle migrate --network cli`

Run the client:

`cd client`
`npm run start`

Run the artist server:

`cd server`
`npm run start`

Once these processes are all running, open a web browser to `localhost:3000` to interact with the application:
1. Log into MetaMask in the browser and connect to the local Ethereum node
2. Commission an artwork by entering a width and height and clicking `Commission Artwork`
3. If you are logged in as the agent's owner (account 0 created by ganache) then you will also be presented with controls to modify the agent. For example, you can change the commissions to expire immediately in order to see the refund functionality.

After the commission is created it will appear below. Once the artwork is created a link will appear to view it on IPFS. If for some reason the artist fails to create the artwork before the commission expires, then the user may request a refund.