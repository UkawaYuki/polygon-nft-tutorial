import './Header.css'

function Header() {
  return (
    <header className="header">
      <h1 className="header-title">
        <span>Scrappy Squirrels Tutorial</span>
      </h1>
      <div>
        <a className='sea-button' href="https://testnets.opensea.io/collection/nft-collectible-fetariueap" target="_blank" rel="noopener noreferrer">
          View Collection on Test Opensea
        </a>
      </div>
    </header>
  )
}

export default Header