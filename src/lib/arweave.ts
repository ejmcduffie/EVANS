import Arweave from 'arweave';
import fs from 'fs';
import path from 'path';

// Initialize Arweave with default configuration
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
});

// Load Arweave key from file
async function loadWalletKey() {
  try {
    const keyFilePath = path.join(process.cwd(), process.env.ARWEAVE_KEY_FILE || '');
    const keyFile = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    return keyFile;
  } catch (error) {
    console.error('Error loading Arweave key file:', error);
    throw new Error('Failed to load Arweave key file');
  }
}

// Upload data to Arweave
interface UploadDataOptions {
  data: string | Uint8Array | ArrayBuffer;
  tags?: Record<string, string>;
  contentType?: string;
}

export async function uploadToArweave({ data, tags = {}, contentType = 'text/plain' }: UploadDataOptions) {
  try {
    const walletKey = await loadWalletKey();
    
    // Create a transaction
    const transaction = await arweave.createTransaction({
      data: data
    }, walletKey);

    // Add tags
    Object.entries(tags).forEach(([key, value]) => {
      transaction.addTag(key, value);
    });
    
    if (contentType) {
      transaction.addTag('Content-Type', contentType);
    }

    // Sign and post the transaction
    await arweave.transactions.sign(transaction, walletKey);
    const response = await arweave.transactions.post(transaction);

    if (response.status === 200 || response.status === 208) {
      return {
        success: true,
        transactionId: transaction.id,
        url: `https://arweave.net/${transaction.id}`
      };
    } else {
      throw new Error(`Failed to upload to Arweave: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading to Arweave:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get data from Arweave
export async function getFromArweave(transactionId: string) {
  try {
    const response = await arweave.transactions.getData(transactionId, { decode: true, string: true });
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error fetching from Arweave:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get transaction status
export async function getTransactionStatus(transactionId: string) {
  try {
    const status = await arweave.transactions.getStatus(transactionId);
    return {
      success: true,
      status
    };
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default {
  uploadToArweave,
  getFromArweave,
  getTransactionStatus
};
