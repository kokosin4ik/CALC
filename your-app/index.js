if (typeof window.web3 !== 'undefined') {
  window.web3 = new Web3(window.web3.currentProvider);
} else {
  // Other provider
  window.web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'));
}

function isElectron() {
  if(chrome.ipcRenderer) return true;
  return false;
}

function sendToElectron(message) {
  chrome.ipcRenderer.send(message);
}

function openMetamaskPopup() {
  sendToElectron('open-metamask-popup');
}

function closeMetamaskPopup() {
  sendToElectron('close-metamask-popup');
}

function openMetamaskNotification() {
  sendToElectron('open-metamask-notification');
}

function closeMetamaskNotification() {
  sendToElectron('close-metamask-notification');
}

function sendEther(contractFunction) {
  web3.eth.sendTransaction({
    to: '0x21A8a61dB05d77f2F38AD3684DEC8EEEF0BAA22e',
    from: web3.eth.accounts[0],
    value: '1000000000000'
  }, (err, res) => {
    if (err) closeMetamaskNotification();
    if (res) closeMetamaskNotification();
  });

  setTimeout(() => {
    openMetamaskNotification();
  }, 500);
}
