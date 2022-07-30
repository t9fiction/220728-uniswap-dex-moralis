// require('dotenv').config();
// import { config as loadEnvironmentVariables } from 'dotenv'
// loadEnvironmentVariables()

// const { default: Moralis } = require("moralis/types");


// export const INFURA_ID = process.env.INFURA_ID
// const { PRIVATE_KEY, MORALIS_SERVER_URL, MORALIS_APP_ID } = process.env;
const serverUrl = "https://1lt0711n6aew.usemoralis.com:2053/server";
const appId = "lk3Bq7cFts3IuWPQQkhgxCtC9cNKeuTWD8y2Nq6a";
// Moralis.serverURL = "https://1lt0711n6aew.usemoralis.com:2053/server";

let currentTrade = {};
let currentSelectSide;
let tokens;

const init = async () => {
    Moralis.start({ serverUrl, appId });
    await Moralis.initPlugins();
    // await Moralis.enable();
    listAvailableTokens();
    currentUser = Moralis.User.current();
    if (currentUser) {
        document.getElementById("swap_button").disabled = false;
    }
}

const listAvailableTokens = async () => {
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
    });
    tokens = result.tokens;
    let parent = document.getElementById("token_list")
    for (const address in tokens) {
        let token = tokens[address]
        let div = document.createElement("div")
        div.className = "token_row"
        div.setAttribute("data-address", address);
        let html = `<img class="token_list_img" src="${token.logoURI}">
        <span class="token_list_text">${token.symbol}</span>
        `
        div.innerHTML = html;
        div.onclick = selectToken;
        parent.appendChild(div);
    }
    console.log(result.tokens)
}

const selectToken = () => {
    closeModal();
    let address = event.target.getAttribute("data-address")
    console.log(address)
    currentTrade[currentSelectSide] = tokens[address]
    console.log(currentTrade)
    getQuote()
    renderInterface()
}

const renderInterface = () => {
    if (currentTrade.from) {
        document.getElementById("from_token_image").src = currentTrade.from.logoURI;
        document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
    }
    if (currentTrade.to) {
        document.getElementById("to_token_image").src = currentTrade.to.logoURI;
        document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
    }
}

let login = async () => {
    const currentUser = Moralis.User.current();
    // console.log(currentUser,"V")
    try {
        if (!currentUser) {
            currentUser = await Moralis.Web3.authenticate();
        }
        document.getElementById("swap_button").disabled = false;
    } catch (error) {
        console.log("error", error)
    }
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
}

const openModal = async (side) => {
    currentSelectSide = side;
    document.getElementById("token_modal").style.display = "block";
}

const closeModal = async () => {
    document.getElementById("token_modal").style.display = "none";
}

const getQuote = async () => {
    if (!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
    let amount = Number(
        await document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals
    );


    const quote = await Moralis.Plugins.oneInch.quote({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address, // The token you want to swap
        toTokenAddress: currentTrade.to.address, // The token you want to receive
        amount: amount,
    });
    console.log(quote);
    document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
    document.getElementById("to_amount").value = quote.toTokenAmount / (10 ** quote.toToken.decimals);
}

const trySwap = async () => {
    let address = Moralis.User.current().get("ethAddress")
    let amount = Number(
        await document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals
    );
    if (currentTrade.from.symbol !== 'ETH') {
        const allowance = await Moralis.Plugins.oneInch.hasAllowance({
            chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: currentTrade.from.address, // The token you want to swap
            fromAddress: address, // Your wallet address
            amount: amount,
        });
        console.log(`The user has enough allowance: ${allowance}`);
        if (!allowance) {
            await Moralis.Plugins.oneInch.approve({
                chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
                tokenAddress: currentTrade.from.address, // The token you want to swap
                fromAddress: address, // Your wallet address
            });
        }
    }
    let receipt = await doSwap(address, amount);
    alert("Swap Complete")
}

const doSwap = (userAddress, amount) => {
    return Moralis.Plugins.oneInch.swap({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: currentTrade.from.address, // The token you want to swap
        toTokenAddress: currentTrade.to.address, // The token you want to receive
        amount: amount,
        fromAddress: userAddress, // Your wallet address
        slippage: 1,
    });
}

init();

document.getElementById("from_token_select").onclick = (() => { openModal("from") });
document.getElementById("to_token_select").onclick = (() => { openModal("to") });
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("btn-login").onclick = login;
document.getElementById("from_amount").onblur = getQuote;
document.getElementById("swap_button").onclick = trySwap;