import { useEffect, useState, useCallback } from "react";
import './App.css';
import contract from './contracts/NFTCollectible.json';
import { ethers } from 'ethers'
import Header from "./components/Header";
import Footer from "./components/Footer";
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/dist/CustomEase'
import { SplitText } from 'gsap/dist/SplitText'

const contractAddress = '0x77e2f3b9E0B95fC2243e5AF246ECcC5bb67F46c5';
const abi = contract.abi;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(null);
  const [mintStatus, setMintStatus] = useState(null);
  const [txnAddress, setTxnAddress] = useState(null);
  const correctNetwork = '0x13881';

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
  
    if (!ethereum) {
      // console.log("Make sure you have MetaMask installed!");
      setMetaMaskInstalled(false);
      return;
    } else {
      // console.log("Wallet exists! We're ready to go!");
      setMetaMaskInstalled(true);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      // console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      // console.log("No authorized account found");
      setCurrentAccount(null);
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install MetaMask!");
    }

    try {
        const network = await ethereum.request({ method: "eth_chainId" });
        if (network !== "0x13881") {
          setWrongNetwork(true);
        }
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        console.log("Found an account! Address: ", accounts[0]);
        setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const checkNetwork = async () => {
    const { ethereum } = window;
    const network = await ethereum.request({ method: "eth_chainId" });
    if(network !== correctNetwork) {
        setWrongNetwork(true);
    } else {
      setWrongNetwork(false);
    }
  }

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);
  
        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFTs(1, {
          value: ethers.utils.parseEther("0.01"),
        });
  
        console.log("Mining... please wait");
        setMintStatus("minting");
        await nftTxn.wait();
  
        console.log(`Mined, see transaction: ${nftTxn.hash}`);
        setMintStatus("success");
        setTxnAddress(nftTxn.hash);
      } else {
        setMintStatus("error");
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      setMintStatus("error");
      console.log(err);
    }
  };

  const connectWalletButton = () => {
    return (
      <button
        onClick={connectWalletHandler}
        className="cta-button connect-wallet-button"
      >
        Connect Wallet
      </button>
    );
  };

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className="cta-button mint-nft-button">
        Mint NFT
      </button>
    );
  };

  const installMetamaskButton = () => {
    return (
      <a className="cta-button install-metamask-button" href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
        Install Metamask
      </a>
    )
  }

  const mineRef = useCallback(async (node) => {
    if (node !== null) {
      gsap.registerPlugin(SplitText, CustomEase)
      CustomEase.create(
        'custom',
        'M0,0 C0.128,0.572 0.444,1.445 0.71,1.446 0.766,1.446 1,1.194 1,1 '
      )
      const move = node.getElementsByTagName('span')
      const enSplit = new SplitText(move, { type: 'words, chars' })
      gsap.from(enSplit.chars, {
        repeat: -1,
        duration: 0.5,
        y: 10,
        scaleY: 0.7,
        opacity: 0,
        stagger: 0.05,
        ease: 'custom'
      })
    }
  })

  useEffect(() => {
    // checkWalletIsConnected();
    setInterval(checkWalletIsConnected, 1000)
    setInterval(checkNetwork, 1000);
  }, []);

  return (
    <div className="main-app">
      {wrongNetwork ? (
        <div className="wrong-network">
          <p>Please connect to the Polygon Testnet on MetaMask!!</p>
        </div>
      ): null}
      <div className="innr">
        <Header />
        <figure className="image"><img src="/00.png" alt="" width={300} height={300} /></figure>
        <p className="price">Price:  <span>0.01</span> MATIC</p>
        <div className="mint-btn-area">{wrongNetwork ? (<p className="message-wrongnet">Change Network to Polygon Testnet on MetaMask</p>) : currentAccount ? mintNftButton() : metaMaskInstalled ? connectWalletButton() : installMetamaskButton()}</div>
        <div className="mint-status-area">
          {mintStatus === 'minting' ? <p className="message-minting text" ref={mineRef}><span>Minting...</span></p> 
          : mintStatus === 'success' ? (
            <div >
              <p className="message-success text">Minted!</p>
              <p className="message-success text">See transaction: <a href={`https://mumbai.polygonscan.com/tx/${txnAddress}`} target="_blank" rel="noreferrer" className="transaction-hash">{txnAddress}</a></p>
            </div>
          ) : mintStatus === 'error' ? (<p className="text">Transaction failed. Please refresh the page and try again.</p>) : null}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;