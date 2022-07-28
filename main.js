// require('dotenv').config();
// import { config as loadEnvironmentVariables } from 'dotenv'
// loadEnvironmentVariables()


// export const INFURA_ID = process.env.INFURA_ID
// const { PRIVATE_KEY, MORALIS_SERVER_URL, MORALIS_APP_ID } = process.env;
const serverUrl = "https://1lt0711n6aew.usemoralis.com:2053/server";
const appId = "lk3Bq7cFts3IuWPQQkhgxCtC9cNKeuTWD8y2Nq6a";
// Moralis.serverURL = "https://1lt0711n6aew.usemoralis.com:2053/server";
Moralis.start({ serverUrl, appId });


const init = async () => {
    await Moralis.initPlugins();
    // await Moralis.enable();
    const tokens = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: 'eth', // The blockchain you want to use (eth/bsc/polygon)
    });
    console.log(tokens);
}

const login = async () => {
    console.log("v")
    try {
        currentUser = await Moralis.User.currentUser();
        if (!currentUser) {
            currentUser = await Moralis.Web3.authenticate();
        }
    } catch (error) {
        console.log("error", error)
    }
}

async function logOut() {
    await Moralis.User.logOut();
    console.log("logged out");
  }

const openModal = async () => {
    document.getElementById("token_modal").style.display = "block";
}

const closeModal = async () => {
    document.getElementById("token_modal").style.display = "none";
}

init();

document.getElementById("from_token_select").onclick = openModal;
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("btn-login").onclick = login;