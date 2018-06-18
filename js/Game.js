
var vue = new Vue({
    el: '#body',
    data: {
        // smart_contract_balance, buy_price_nas_per_resource, sell_price_resources_per_nas, 
        // my_resources, my_resources_nas_value
        // my_production_rate, my_bonus, items
        info: {},
        display_resources: 0,
        display_value: 0,
        show_buy_options: false,
        nas_to_spend: 0.0001
    },
    methods: {
        buy,
        redeemNas,
        buyWithNas,
    },
    filters: {
        bonus: function(value)
        {
            return numberWithCommas(value) + "%";
        },
        count: function(value)
        {
            return numberWithCommas(value);
        },
        rate: function(value)
        {
            return "$" + numberWithCommas(value) + "/s";
        },
        resources: function(value)
        {
            return "$" + numberWithCommas(value);
        },
        nas: function(value)
        {
            return formatCoins(value, 18);
        },
    }
});
Vue.component('modal', {
    template: '#modal-template'
  })
  

//#region User Actions
function buy(name, quantity)
{
    nebWriteWithStatus("buy", [name, quantity], 0);
}

function redeemNas()
{
    nebWriteWithStatus("redeemNas", null, 0, "You Got Money!!  Check your NAS balance.", function()
    {
        redirectToHome("/exit.html");
    });
}

function buyWithNas(value)
{
    vue.show_buy_options = false;
    nebSendWithStatus(contract_address, value);
}
//#endregion


function refreshResources()
{
    nebReadWithStatus("getInfo", null, function(info)
    {
        if(info)
        {
            var temp = info.items[2];
            info.items[2] = info.items[1];
            info.items[1] = temp;
            vue.info = info;
        }
    });
}
refreshResources();
setInterval(refreshResources, 5000);

function refreshUI()
{
    var target_resources = vue.info.my_resources;
    if(!target_resources)
    {
        target_resources = 0;
    }
    var target_value = vue.info.my_resources_nas_value;
    if(!target_value)
    {
        target_value = 0;
    }   

    var delta_resources = target_resources - vue.display_resources;
    vue.display_resources += delta_resources * .05;
    if(!vue.display_resources)
    {
        vue.display_resources = 0;
    }

    var delta_value = target_value - vue.display_value;
    vue.display_value += delta_value * .05;
    if(!vue.display_value)
    {
        vue.display_value = 0;
    }
}
setInterval(refreshUI, 50);





// var target_gold = 0;
// var target_value = 0;
// setInterval(function()
// {
//    
// }, 50);

// function refreshGold()
// {
//     nebRead("getMyGold", null, function(resp, error)
//     {
//         target_gold = resp;
//         setTimeout(refreshGold, 5000);
//     });
// }
// refreshGold();

// function refreshGoldValue()
// {
//     nebRead("getMyGoldValue", null, function(resp, error)
//     {
//         target_value = resp;
//         setTimeout(refreshGoldValue, 5000);
//     });
// }
// refreshGoldValue();

// nebRead("getMyBaseProductionRate", null, function(base_rate)
// {
//     $("#production-rate-base").text(numberWithCommas(base_rate));

//     nebRead("getMyBonusMultiplier", null, function(multiplier)
//     {
//         $("#production-rate-bonus").text(numberWithCommas((multiplier - 100)));
//         $("#production-rate").text(numberWithCommas(base_rate * multiplier / 100));
//     })
// });


// nebRead("getAllItemIds", null, function(resp, error)
// {
//     $("#items").empty();

//     for(var i = 0; i < resp.length; i++)
//     {
//         var item_id = resp[i];
//         nebRead("getItem", [item_id], function(item, error)
//         {
//             vue.items.push(item);
//             vue.items.sort(function(a, b)
//             {
//                 return a.sort_id < b.sort_id;
//             });
//         })
//     }
// })

// nebReadAnon("getNasPerGoldConversionRate", null, function(conversion_rate)
// {
//     vue.conversion_rate = conversion_rate;
// });
