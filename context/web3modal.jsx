import { createWeb3Modal, defaultConfig, useWeb3ModalAccount } from '@web3modal/ethers5/react';
import { useEffect, useState } from 'react';

// 1. Get projectId
const projectId = '7392393195e7d432a8c841b79f3c2616';

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com',
};

const binanceTestnet = {
  chainId: 97,
  name: 'Binance Smart Chain Testnet',
  network: 'bsc-testnet',
  currency: 'BSC',
  rpcUrl: 'https://data-seed-prebsc-2-s2.binance.org:8545',
  explorerUrl: 'https://testnet.bscscan.com',
};
const binanceMainnet = {
  chainId: 56,
  name: 'BNB Smart Chain Mainnet',
  network: 'bsc',
  currency: 'BNB',
  rpcUrl: 'https://bsc-dataseed1.binance.org/',
  explorerUrl: 'https://bscscan.com',
};
// https://endpoints.omniatech.io/v1/bsc/testnet/public
// https://data-seed-prebsc-1-s2.bnbchain.org:8545
// https://data-seed-prebsc-2-s2.bnbchain.org:8545
// 3. Create modal
const metadata = {
  name: 'UltronGPT',
  description: 'My Website description',
  url: 'https://ultrongpt.io',
  icons: ['/logo.png'],
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [binanceTestnet],
  defaultChain: [binanceTestnet],
  projectId,
  
});

export function Web3ModalProvider({ children }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return isReady ? children : null;
}
