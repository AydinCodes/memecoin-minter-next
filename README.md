# SolMinter - Solana Token Creator

SolMinter is a full-featured web application that allows users to create and deploy Solana tokens with ease. The platform provides a user-friendly interface for token creation, with options for customizing token parameters, metadata, and authority settings.

## Features

- **Simple Token Creation**: Create Solana tokens with just a few clicks and no coding required
- **Wallet Integration**: Seamless integration with popular Solana wallets (Phantom, Solflare, etc.)
- **Authority Management**: Options to revoke mint, freeze, and update authorities for better investor trust
- **Metadata Customization**: Add token description, social links, and other metadata
- **IPFS Integration**: Token logos and metadata stored on IPFS via Pinata
- **Beautiful UI**: Modern, responsive design with dark theme

## Getting Started

### Prerequisites

- Node.js 18+ and bun/npm
- A Pinata account for IPFS storage
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/solminter.git
   cd solminter
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. Set up environment variables by copying the example file:
   ```
   cp .env.local.example .env.local
   ```

4. Edit `.env.local` and add your:
   - Pinata JWT token
   - Solana network preference (devnet or mainnet-beta)
   - Fee recipient wallet address (if different from default)

5. Start the development server:
   ```
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Token Creation Process

1. Connect your wallet using the "Connect Wallet" button in the navbar
2. Fill in token details (name, symbol, supply, etc.)
3. Upload a logo for your token (recommended 1000x1000px)
4. Configure optional features like social links
5. Set authority revocation preferences
6. Click "Launch Token" and approve the transactions in your wallet
7. Once successful, you'll receive the token address and explorer link

## Fees

The application charges a small fee for token creation:
- Base fee: 0.2 SOL
- Additional fees for options like revoking authorities: 0.1 SOL each
- The total fee is capped at 0.3 SOL with our discount

All fees are sent to the designated fee wallet configured in the environment variables.

## Deployment

To deploy SolMinter to production:

1. Build the application:
   ```
   bun run build
   ```

2. Start the production server:
   ```
   bun start
   ```

For cloud deployments, we recommend using Vercel or similar platforms with Next.js optimization.

## Project Structure

```
solminter/
├── src/
│   ├── app/               # Next.js app router
│   │   ├── api/           # API routes for IPFS uploads
│   │   ├── create-token/  # Token creation page
│   │   ├── guides/        # Guides & resources page  
│   │   └── ...
│   ├── components/        # React components
│   │   ├── layout/        # Layout components (navbar, footer)
│   │   ├── token/         # Token-related components
│   │   └── wallet/        # Wallet connection components
│   ├── services/          # Service functions
│   │   └── token-service.ts  # Token creation logic
│   └── config/            # Configuration files
├── public/                # Static assets
└── ...
```

## Technologies Used

- **Next.js**: React framework with server-side rendering
- **TypeScript**: For type safety
- **@solana/web3.js**: Solana JavaScript API
- **@solana/spl-token**: For token creation and management
- **@solana/wallet-adapter**: Wallet connection
- **Pinata SDK**: For IPFS storage
- **TailwindCSS**: For styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.