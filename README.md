# SolHype - Solana Meme Coin & Token Creator

SolHype is a user-friendly web application designed for creating and launching Solana tokens and meme coins with ease. The platform provides a streamlined interface for token creation, with advanced options for customizing token parameters, metadata, and security settings.

## Features

- **Easy Token Creation**: Create Solana tokens and meme coins in minutes without any coding
- **Wallet Integration**: Seamless connection with popular Solana wallets (Phantom, Solflare, Ledger)
- **Authority Management**: Options to revoke mint, freeze, and update authorities to build investor trust
- **Social Integration**: Add social media links directly to your token's metadata
- **Creator Information**: Customize creator details in your token metadata
- **IPFS Storage**: Token logos and metadata securely stored on IPFS via Pinata
- **Token Management**: View and manage all your created tokens in one place
- **Liquidity Integration**: Direct links to create liquidity pools on Raydium DEX
- **Mobile Blocking**: Desktop-optimized experience with mobile device detection

## Getting Started

### Prerequisites

- Node.js 18+ and npm/bun
- A Pinata account with JWT token for IPFS storage
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/solhype.git
   cd solhype
   ```

2. Install dependencies:
   ```
   npm install
   # or
   bun install
   ```

3. Set up environment variables by copying the example file:
   ```
   cp .env.local.example .env.local
   ```

4. Edit `.env.local` and add your:
   - Pinata JWT token
   - Pinata gateway URL
   - Solana network preference (devnet or mainnet-beta)
   - Fee recipient wallet address
   - Private key for update authority revocation (optional)

5. Start the development server:
   ```
   npm run dev
   # or
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Token Creation Process

1. Connect your wallet using the wallet button in the navbar
2. Fill in token details (name, symbol, supply, decimals, etc.)
3. Upload a logo for your token (PNG or JPG, up to 500KB standard or 10MB with large image option)
4. Add a detailed description for your token
5. Configure optional features like social links and creator information
6. Choose which authorities to revoke (recommended for investor trust)
7. Review the total fee and click "Launch Token"
8. Approve the transaction in your wallet
9. Once successful, you'll receive the token address, explorer link, and options to create liquidity

## Fees

The application charges a small fee for token creation with a 50% discount promotion:

- Base fee: 0.05 SOL
- Additional fees for each feature:
  - Authority revocation (mint, freeze, update): 0.05 SOL each
  - Social links: 0.05 SOL
  - Creator information: 0.05 SOL
  - Large image size: 0.05 SOL

All fees are sent to the designated fee wallet configured in the environment variables.

## Project Structure

```
solhype/
├── src/
│   ├── app/                      # Next.js app router
│   │   ├── api/                  # API routes for various services
│   │   │   ├── create-token/     # Token creation API
│   │   │   ├── sign-transaction/ # Transaction signing API
│   │   │   ├── upload-image/     # IPFS image upload API
│   │   │   ├── upload-metadata/  # IPFS metadata upload API 
│   │   │   ├── user-tokens/      # User token discovery API
│   │   │   └── ...
│   │   ├── create-token/         # Token creation page
│   │   ├── my-tokens/            # Token management page
│   │   ├── guides/               # Guides & resources page
│   │   ├── support/              # Support request page
│   │   ├── privacy/              # Privacy policy page
│   │   ├── terms/                # Terms of service page
│   │   └── ...
│   ├── components/               # React components
│   │   ├── home/                 # Homepage components
│   │   ├── layout/               # Layout components (navbar, footer)
│   │   ├── token/                # Token-related components
│   │   ├── ui/                   # UI components (loading, animations)
│   │   ├── wallet/               # Wallet connection components
│   │   └── guides/               # Guide components
│   ├── services/                 # Service functions
│   │   ├── token-creation/       # Token creation logic
│   │   ├── fee-service.ts        # Fee calculation service
│   │   ├── ipfs-service.ts       # IPFS storage service
│   │   ├── pinata-cleanup.ts     # IPFS cleanup service
│   │   ├── token-service.ts      # Main token service
│   │   └── wallet-service.ts     # Wallet interaction service
│   ├── styles/                   # Global styles and animations
│   ├── utils/                    # Utility functions
│   ├── types/                    # TypeScript type definitions
│   └── config/                   # Configuration files
├── public/                       # Static assets
└── ...
```

## Key Technologies

- **Next.js 14**: React framework with app router and server components
- **TypeScript**: For type safety and improved developer experience
- **@solana/web3.js**: Solana JavaScript API
- **@solana/spl-token**: For token creation and management
- **@solana/wallet-adapter**: Wallet connection libraries
- **Framer Motion**: For animations and transitions
- **TailwindCSS**: For styling and responsive design
- **IPFS/Pinata**: For decentralized storage of token assets

## Environment Variables

```
# Solana Network settings
NEXT_PUBLIC_SOLANA_NETWORK=devnet  # or mainnet-beta

# Fee recipient wallet address
NEXT_PUBLIC_FEE_WALLET=your_wallet_address_here

# Pinata IPFS settings
NEXT_PUBLIC_PINATA_GATEWAY=your_gateway_here
PINATA_JWT=your_jwt_token_here

# Solana network fee
NEXT_PUBLIC_SOLANA_NETWORK_FEE=0.01862

# Server-side update authority private key (base58 encoded)
REVOKE_UPDATE_PRIVATE_KEY=your_private_key_here
```

## Deployment

To deploy SolHype to production:

1. Build the application:
   ```
   npm run build
   # or
   bun run build
   ```

2. Start the production server:
   ```
   npm start
   # or
   bun start
   ```

For cloud deployments, we recommend using Vercel, Netlify, or similar platforms with Next.js optimization.

## Features in Detail

### Token Creation
- Complete customization of token parameters (name, symbol, decimals, supply)
- Logo upload with support for standard (500KB) or large images (10MB)
- Detailed token description and creator information
- Social media link integration

### Authority Management
- Revoke mint authority to create a fixed supply token
- Revoke freeze authority to prevent token freezing
- Revoke update authority to make metadata immutable

### Token Management
- View all tokens created with your wallet
- Direct links to Solana Explorer, Raydium DEX, and IPFS
- Token analytics and authority status information

### User Experience
- Step-by-step guides for token creation and management
- Animated loading screens with transaction progress
- Comprehensive error handling and validation
- Desktop-optimized interface with mobile blocking

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please visit the [Support Page](https://yourdomain.com/support) or open an issue on GitHub.