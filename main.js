// require('dotenv').config();
// import { config as loadEnvironmentVariables } from 'dotenv'
// loadEnvironmentVariables()


// export const INFURA_ID = process.env.INFURA_ID
// const { PRIVATE_KEY, MORALIS_SERVER_URL, MORALIS_APP_ID } = process.env;
Moralis.initialize("lk3Bq7cFts3IuWPQQkhgxCtC9cNKeuTWD8y2Nq6a");
Moralis.serverURL = "https://1lt0711n6aew.usemoralis.com:2053/server";

// Moralis.start({ serverUrl, appId });


const login = async ()=>{
    console.log("v")
    try {
        currentUser = await Moralis.User.currentUser();
        if(!currentUser){
            currentUser = await Moralis.Web3.authenticate();
        }
    } catch (error) {
        console.log("error",error)
    }
}

document.getElementById("btn-login").onclick = login;