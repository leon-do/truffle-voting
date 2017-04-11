// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoinArtifacts from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const MetaCoin = contract(metacoinArtifacts)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

window.App = {
  start: function () {
    let self = this

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts((err, accs) => {
      if (err) {
        window.alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        window.alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]

      self.refreshBalance()
    })
  },

  setStatus: function (message) {
    let status = document.getElementById('status')
    status.innerHTML = message
  },

  refreshBalance: function () {
    let self = this

    let meta
    MetaCoin.deployed().then((instance) => {
      meta = instance
      return meta.getBalance.call(account, { from: account })
    }).then((value) => {
      let balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value.valueOf()
    }).catch((e) => {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })
  },

  sendCoin: function () {
    let self = this

    let amount = parseInt(document.getElementById('amount').value)
    let receiver = document.getElementById('receiver').value

    self.setStatus('Initiating transaction... (please wait)')

    let meta
    MetaCoin.deployed().then((instance) => {
      meta = instance
      return meta.sendCoin(receiver, amount, { from: account })
    }).then(() => {
      self.setStatus('Transaction complete!')
      self.refreshBalance()
    }).catch((e) => {
      console.log(e)
      self.setStatus('Error sending coin; see log.')
    })
  }
}

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      `
      Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, 
      ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete 
      this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask
      `
    )
    // Use Mist/MetaMask's provider
    //window.web3 = new Web3(web3.currentProvider)
    var contract = web3.eth.contract([{"constant":false,"inputs":[{"name":"userArray","type":"uint256[]"}],"name":"totalVotes","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"voteA","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"voteB","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"}])
    var instance = contract.at('0x2B79dFf7cD509365B664ED7A1d4C06Ee04c15e31')
    instance.totalVotes([123, 1], (data) => {
      console.log(data)
      console.log('voted')
    })
  } else {
    console.warn(
      `
      No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, 
      as it's inherently insecure. Consider switching to Metamask for development. 
      More info here: http://truffleframework.com/tutorials/truffle-and-metamask
      `
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  }

  window.App.start()
})
