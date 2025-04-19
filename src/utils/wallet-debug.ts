// src/utils/wallet-debug.ts

/**
 * Helper function to debug wallet connection status
 */
export function debugWallet(wallet: any) {
    const connection = {
      walletExists: !!wallet,
      publicKeyExists: wallet ? !!wallet.publicKey : false,
      publicKeyValue: wallet && wallet.publicKey ? wallet.publicKey.toString() : 'none',
      adapterExists: wallet ? !!wallet.adapter : false,
      adapterConnected: wallet?.adapter ? !!wallet.adapter.connected : false,
      walletName: wallet?.adapter?.name || 'unknown'
    };
    
    console.log("===== WALLET DEBUG INFO =====");
    console.table(connection);
    console.log("=============================");
    
    return connection;
  }
  
  /**
   * Helper function to debug wallet adapter capabilities
   */
  export function debugWalletCapabilities(wallet: any) {
    if (!wallet || !wallet.adapter) {
      console.log("No wallet adapter found");
      return;
    }
    
    const adapter = wallet.adapter;
    
    const capabilities = {
      name: adapter.name,
      icon: !!adapter.icon,
      connected: !!adapter.connected,
      publicKey: !!adapter.publicKey,
      connecting: !!adapter.connecting,
      ready: !!adapter.ready,
      supportedTransactionVersions: adapter.supportedTransactionVersions ? 
        Array.from(adapter.supportedTransactionVersions) : [],
      hasConnect: typeof adapter.connect === 'function',
      hasDisconnect: typeof adapter.disconnect === 'function',
      hasSignTransaction: typeof adapter.signTransaction === 'function',
      hasSignAllTransactions: typeof adapter.signAllTransactions === 'function',
      hasSignMessage: typeof adapter.signMessage === 'function',
      hasSendTransaction: typeof adapter.sendTransaction === 'function',
    };
    
    console.log("===== WALLET CAPABILITIES =====");
    console.table(capabilities);
    console.log("===============================");
    
    return capabilities;
  }