// Global variables used by our Dapp
var contract_address;

var gas_price = 1000000;
var gas_limit = 200000;
var contract_address = "n1rFJSKaqS198cbDChWD3zHQusqgmAHc3AG"//neb_contract.contract;
var nebulas_domain =  "https://mainnet.nebulas.io";//neb_contract.apiUrl; //
var is_mainnet = true;
var explorer_tx_url = "https://explorer.nebulas.io/#/tx/"; 

var token_divider = 1000000000000000000;

var spinner = '<img src="spinner.gif" class="spinner"/>';

function redirectToHome(path)
{
    if(!path)
    {
        path = "";
    }
    var href = window.location.href;
    var dir = href.substring(0, href.lastIndexOf('/')) + path;
    window.location =  dir;  
}

function getSecret(onComplete)
{
    var secret = localStorage.getItem('secret');
    if(secret)
    {
        onComplete(secret);
    }
    else 
    {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", 'english_words.txt');
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    var allText = rawFile.responseText;
                    var phrase = "";
                    for(var i = 0; i < 12; i++)
                    {
                        var lines = allText.split('\n');
                        var random_id = Math.floor(Math.random() * lines.length);
                        var line = lines[random_id];
                        if(i > 0)
                        {
                            phrase += " ";
                        }
                        phrase += line;
                    }
                    secret = phrase;
                    setSecret(secret);
                    onComplete(secret);
                }
            }
        }
        rawFile.send(null);
    }
}

function setSecret(secret)
{
    localStorage.setItem('secret', secret);
}

// From https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
const numberWithCommas = (x, decimals) => {
    if(decimals == null)
    {
        decimals = 0;
    }
    var parts = Number.parseFloat(x).toFixed(decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

function formatCoins(number, digits, unit) 
{
    if(!unit)
    {
        unit = "nas";
    }
    if(!digits)
    {
        digits = 8;
    }
    var x = number / token_divider;
    return numberWithCommas(x, digits) + " " + unit;
}

var status_cooldown;
function hideStatus()
{
    $("#status-card").modal('hide');    
}
function showStatus(title, message, timeout, onTimeout)
{
    if(status_cooldown)
    {
        clearTimeout(status_cooldown);
        status_cooldown = null;
    }

    $("#status-card-title").text(title);
    $("#status-card-content").empty();
    $("#status-card-content").append(message);
    $("#status-card").modal('show');

    if(timeout) 
    {
        status_cooldown = setTimeout(function() 
        {
            hideStatus();
            if(onTimeout)
            {
                onTimeout();
            }
        }, timeout);
    }
}

var button = '<div class="mt-3 text-center" style="width:100%"><button class="btn btn-secondary" onclick="window.open(\'' + explorer_tx_url 
    + '$\')">View on Block Explorer</button></div>';
function nebWriteWithStatus(method, args, amount, complete_message, on_complete)
{
    nebWrite(method, args, function(resp)
    { // tx in mempool
        showStatus("Posting transaction", "Please wait for the transaction to be added to a block. " + spinner + button.replace("$", resp.txhash));
    }, amount, function(resp)
    { // tx in block
        hideStatus();
        if(on_complete)
        {
            on_complete(resp);
        }

        if(complete_message)
        {
            showStatus("Transaction Complete", complete_message + button.replace("$", resp.txhash), 2000, function()
            {
                hideStatus();
            });
        }
    }, function(resp)
    { // error
        showStatus("Transaction Error", resp, 10000);                
    });
}

// TODO merge with above?
function nebSendWithStatus(to, amount, complete_message, on_complete)
{
    nebSend(to, function(resp)
    { // tx in mempool
        showStatus("Posting transaction", "Please wait for the transaction to be added to a block. " + spinner + button.replace("$", resp.txhash));
    }, amount, function(resp)
    { // tx in block
        hideStatus();
        if(on_complete)
        {
            on_complete(resp);
        }

        if(complete_message)
        {
            showStatus("Transaction Complete", complete_message + button.replace("$", resp.txhash), 2000, function()
            {
                hideStatus();
            });
        }
    }, function(resp)
    { // error
        showStatus("Transaction Error", resp, 10000);                
    });
}

function nebReadWithStatus(method, args, results)
{
    nebRead(method, args, function(resp, error)
    {
        if(error) 
        { 
            showStatus("Error", error, 5000);
            console.log(error);
            return;
        }

        results(resp);
    });

}
 
function formatAddress(address)
{
    address = address.trim();
    var prefix = address.substring(0, 2);
    var suffix = address.substring(address.length - 3);
    return prefix + ".." + suffix;
}