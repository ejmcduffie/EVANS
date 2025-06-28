# Ancestry Chain

A decentralized application for managing ancestry data on the blockchain.

## Features

- **Blockchain Integration**: Built on Polygon Amoy testnet
- **Decentralized Storage**: Secure file storage using Arweave
- **Smart Contracts**: For managing ancestry data and transactions

## Arweave Integration

This project uses Arweave for decentralized file storage. The integration allows you to:

- Upload files and data to the permaweb
- Store metadata and content hashes on-chain
- Retrieve files using their transaction IDs

### Setup

1. **Environment Variables**

   Add your Arweave key file path to the `.env` file:
   ```
   ARWEAVE_KEY_FILE=path/to/your/arweave-keyfile.json
   NEXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net
   ```

2. **Usage**

   ```typescript
   // Import the Arweave utilities
   import { uploadFileToArweave, uploadJsonToArweave, getFromArweave } from '@/lib/arweave-upload';
   
   // Upload a file (browser)
   async function handleFileUpload(file: File) {
     const result = await uploadFileToArweave(file, {
       tags: {
         'App-Name': 'AncestryChain',
         'Content-Type': file.type
       }
     });
     
     if (result.success) {
       console.log('File uploaded:', result.url);
       return result.transactionId;
     }
   }
   
   // Upload JSON data
   async function uploadAncestryData(data: any) {
     const result = await uploadJsonToArweave(data, {
       'App-Name': 'AncestryChain',
       'Data-Type': 'ancestry-record'
     });
     
     if (result.success) {
       console.log('Data uploaded:', result.url);
       return result.transactionId;
     }
   }
   
   // Retrieve data
   async function getData(transactionId: string) {
     const result = await getFromArweave(transactionId);
     if (result.success) {
       console.log('Retrieved data:', result.data);
       return result.data;
     }
   }
   ```

### Available Functions

- `uploadFileToArweave(file, options)`: Upload a file to Arweave
- `uploadJsonToArweave(data, tags)`: Upload JSON data to Arweave
- `getFromArweave(transactionId)`: Retrieve data from Arweave
- `getTransactionStatus(transactionId)`: Check the status of an Arweave transaction

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Git

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
3. Copy `.env.example` to `.env` and update the values
4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## License

MIT
