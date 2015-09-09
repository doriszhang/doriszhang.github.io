
(function ($) {

    $(document).foundation();

}(jQuery));

//---test---

var targetURL = '/en/owner/login';
var referURL = getQS('REFERER');
var allParams = window.location.href.substring(window.location.href.indexOf('?') + 1);
//console.log(targetURL + "?REFERER=" + referURL);
window.location.href = targetURL + "?REFERER=" + referURL;
//window.location.href = targetURL + "?" + allParams;

function getQS(paramName) {
    var reg = new RegExp("[\?&]" + paramName + "=([^&]*)[&]?", "i");
    var paramVal = window.location.search.match(reg);
    return paramVal == null ? "" : paramVal[1];
}

var options = ["福特嘉年华", "福特经典福克斯", "福特新福克斯", "福特新蒙迪欧", "福特致胜"];
$("select#voi-model-name").on("change", function () {
    var test = 1;
});
$("select#voi-model-name").onchange = function () {
    var test = 1;
};

document.getElementById("voi-model-name").onchange = function () {
    var ddlOpts=document.getElementById("voi-model-name").options;
    for (var i = 0; i < ddlOpts.length; i++) {
        if (options.indexOf(ddlOpts[i]) > 0) {
            ddlOpts[i].hidden = true;
        }
    }
};


var index = [1, 2, 3, 4, 5];    //index of options, start from 0
var int = window.setInterval(function () {
    if (document.getElementById("voi-model-name").options.length > 1) {
        var ddlOpts = document.getElementById("voi-model-name").options;
        var removeOpts = new Array();
        for (var i = 0; i < index.length; i++) {
            if (ddlOpts[index[i]]) {
                removeOpts.push(ddlOpts[index[i]]);
            }
        }
        for (var k = 0; k < removeOpts.length; k++) {
            document.getElementById("voi-model-name").removeChild(removeOpts[k]);
        }
        window.clearInterval(int);
    }
}, 500);

setTimeout(function () {
    
    var ddlState = $('#dealer-by-statecity-state');
    var ddlCity = $('#dealer-by-statecity-city');

    if ($('#ddl-mapping').length > 0 && ddlState.length > 0 && ddlCity.length > 0) {
        var mappingConfig = $('#ddl-mapping').embeddedData();
        var ddlState_opts=$('#dealer-by-statecity-state').find('option');
        for (var i = 0; i < ddlState_opts.length; i++) {
            var v = ddlState_opts[i].value;
            if (v.length > 0) {
                ddlState_opts[i].value = mappingConfig.v;
            }
        }
    }

}, 800);

var ddlState = $('#dealer-by-statecity-state');
var ddlCity = $('#dealer-by-statecity-city');
var isPostBack = false;

if ($('#ddl-mapping').length > 0 && ddlState.length > 0 && ddlCity.length > 0) {
    var mappingConfig = $('#ddl-mapping').embeddedData();    
    ddlState.on('change', function () {
        if (!isPostBack) {
            //var ddlState_opts = ddlState.find('option');
            //for (var i = 0; i < ddlState_opts.length; i++) {
            //    if (ddlState_opts[i].value.length > 0 && mappingConfig[ddlState_opts[i].value]) {
            //        ddlState_opts[i].value = mappingConfig[ddlState_opts[i].value];
            //    }
            //}
            updateOptions(ddlState, mappingConfig);
            isPostBack = true;
        }
        else {
            window.setTimeout(function () {
                updateOptions(ddlCity, mappingConfig);
            }, 800);
        }
    });
}
function updateOptions($ddl, config) {
    var opts = $ddl.find('option');
    for (var i = 0; i < opts.length; i++) {
        if (opts[i].value.length > 0 && config[opts[i].value]) {
            opts[i].value = config[opts[i].value];
        }
    }
}

var ddlState = $('#dealer-by-statecity-state');
var ddlCity = $('#dealer-by-statecity-city');
var isPostBack = false;

if ($('#ddl-mapping').length > 0 && ddlState.length > 0 && ddlCity.length > 0) {
    var mappingConfig = $('#ddl-mapping').embeddedData();
    $('form#dragonflyform').on('submit', function () {
        var state_val = mappingConfig[ddlState.val()];
        var city_val = mappingConfig[ddlCity.val()];
        if (state_val) {
            updateDDLValue(ddlState, state_val);
        }
        if (city_val) {
            updateDDLValue(ddlCity, state_val);
        }
        console.log(ddlState.val());
        console.log(ddlCity.val());
    });
}

function updateDDLValue($ddl, value) {
    var opt = $ddl.find('option[value=' + $ddl.val() + ']');
    if (opt.length > 0) {
        opt[0].value = value;
        $ddl.val(value);
    }
}

(function () {
    window.sync = function (func) {
        var num = 100;
        var syncId = window.setInterval(function () {
            if (typeof jQuery != "undefined") {
                window.clearInterval(syncId);
                func();
            } else if (!num--) {
                window.clearInterval(syncId);
            }
        }, 80);
    }
})();

window.sync(function () {
    (function ($) {

        var ddlState = $('#dealer-by-statecity-state');
        var ddlCity = $('#dealer-by-statecity-city');
        var isPostBack = false;

        if ($('#ddl-mapping-state').length > 0 && $('#ddl-mapping-city').length > 0 && ddlState.length > 0 && ddlCity.length > 0) {
            var mappingConfig_state = $('#ddl-mapping-state').embeddedData();
            var mappingConfig_city = $('#ddl-mapping-city').embeddedData();
            $('form#dragonflyform').on('submit', function () {
                var state_val = mappingConfig_state[ddlState.val()];
                var city_val = mappingConfig_city[ddlCity.val()];
                if (state_val) {
                    updateDDLValue(ddlState, state_val);
                }
                if (city_val) {
                    updateDDLValue(ddlCity, city_val);
                }
            });
        }

        function updateDDLValue($ddl, value) {
            var opt = $ddl.find('option[value=' + $ddl.val() + ']');
            if (opt.length > 0) {
                opt[0].value = value;
                $ddl.val(value);
            }
        }
    })(jQuery)

});


window.sync(function () {
    (function ($) {

        var int = window.setInterval(function () {
            var $btn = $('.cal-section > .summary > .column.sum > .button > .featurebtn');
            if ($btn.length && $btn.attr('href').indexOf('?ctx')) {
                $btn.attr('href', $btn.attr('href').replace('?ctx', '&ctx'));
            }
        }, 500);

    })(jQuery)

});


(function () {
    var locations = document.getElementById('QuoteDealer_StateCityDealer_Location'),
        dealers = document.getElementById('QuoteDealer_StateCityDealer_Dealer'),
        dealerCode = document.getElementById('QuoteDealer_StateCityDealer_DealerCode');
    if (locations && dealers && dealerCode) {

        locations.onchange = function () {
            dealers.options.length = 0;
            if (locations.value !== '') {
                for (li = 0; li < stateCityDealers['cityStates'].length; li++) {
                    if (stateCityDealers['cityStates'][li]['location'] == locations.value) {
                        for (di = 0; di < stateCityDealers['cityStates'][li]['dealers'].length; di++) {
                            var dealer = stateCityDealers['cityStates'][li]['dealers'][di];
                            dealers.options[di] = document.createElement("option");
                            dealers.options[di].text = dealer.description;
                            dealers.options[di].value = dealer.name;
                            if (di === 0) {
                                dealerCode.value = dealer.code;
                            }
                        }
                        break;
                    }
                }
            } else {

                dealers.options[0] = document.createElement("option");
                dealers.options[0].text = '';
                dealers.options[0].value = '';
                dealerCode.value = '';
            }
        }

        dealers.onchange = function () {
            if (locations.value !== '') {
                for (li = 0; li < stateCityDealers['cityStates'].length; li++) {
                    if (stateCityDealers['cityStates'][li]['location'] == locations.value) {
                        for (di = 0; di < stateCityDealers['cityStates'][li]['dealers'].length; di++) {
                            var dealer = stateCityDealers['cityStates'][li]['dealers'][di];
                            if (dealer.name === dealers.value) {
                                dealerCode.value = dealer.code;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
}());

(function () {

    var Constants={
        StateTXT:'Selecione a State',
        CityTXT:'Selecione a City',
        StateID:'QuoteDealer_StateCityDealer_State',
        CityID:'QuoteDealer_StateCityDealer_City'
    };

    var ddl_locations = document.getElementById('QuoteDealer_StateCityDealer_Location');
    if (ddl_locations) {
        var parentNode = ddl_locations.parentNode.parentNode;
        parentNode.insertBefore(createDDLController(Constants.StateID, Constants.StateTXT), ddl_locations.parentNode);
        parentNode.insertBefore(createDDLController(Constants.CityID, Constants.CityTXT), ddl_locations.parentNode);
        ddl_locations.parentNode.style.display = "none";
    }
    function createDDLController(id,text) {
        var controller = document.createElement('div');
        var label = document.createElement('label');
        var ddl = document.createElement('select');
        label.setAttribute('for', id);
        label.innerHTML = text + ":" + "<span class='ast'>*</span>";
        ddl.setAttribute('id', id);
        ddl.setAttribute('name', id);
        ddl.innerHTML = "<option value=''></option>";
        controller.appendChild(label);
        controller.appendChild(ddl);
        return controller;
    }

    var ddl_state = document.getElementById(Constants.StateID),
        ddl_city = document.getElementById(Constants.CityID),
        ddl_dealers = document.getElementById('QuoteDealer_StateCityDealer_Dealer'),
        dealerCode = document.getElementById('QuoteDealer_StateCityDealer_DealerCode');
    if (ddl_state && ddl_city && ddl_dealers && dealerCode) {

        var locationObj = {};
        var splitSymbol = ' - ';
        for (var i = 0; i < stateCityDealers['cityStates'].length; i++) {
            var location = stateCityDealers['cityStates'][i].location;
            if (location.indexOf(splitSymbol) > 0) {
                var state = location.split(splitSymbol)[0];
                var city = location.split(splitSymbol)[1];
                var dealers=stateCityDealers['cityStates'][i].dealers;                
                if (typeof (locationObj[state]) === 'undefined') {
                    locationObj[state] = [];
                }
                locationObj[state].push({ 'city': city, 'dealers': dealers });
            }
        }
        //console.log(locationObj);
        for (var s in locationObj) {
            if (s && s.length) {
                ddl_state.options.add(new Option(s, s));
            }
        }

        ddl_state.onchange = function () {
            ddl_city.options.length = 0;
            ddl_dealers.options.length = 0;
            if (ddl_state.value !== '' && locationObj[ddl_state.value] && locationObj[ddl_state.value].length > 0) {
                for (var i = 0; i < locationObj[ddl_state.value].length; i++) {
                    var c = locationObj[ddl_state.value][i].city;
                    ddl_city.options.add(new Option(c, c));
                }
                loadDealersOpts();
            }
        };

        function loadDealersOpts() {
            ddl_dealers.options.length = 0;
            if (ddl_state.value !== '' && ddl_city.value !== '') {
                var locationValue = ddl_state.value + ' - ' + ddl_city.value;
                document.getElementById('QuoteDealer_StateCityDealer_Location').value = locationValue;
                for (var i = 0; i < locationObj[ddl_state.value].length; i++) {
                    if (locationObj[ddl_state.value][i].city === ddl_city.value) {
                        var dealers = locationObj[ddl_state.value][i].dealers;
                        if (dealers) {
                            for (var d = 0; d < dealers.length; d++) {
                                ddl_dealers.options.add(new Option(dealers[d].description, dealers[d].name));
                                if (d === 0) {
                                    dealerCode.value = dealers[d].code;
                                }
                            }                            
                        }
                        break;
                    }
                }
            }
        };

        ddl_city.onchange = function () {
            loadDealersOpts();
        };

        ddl_dealers.onchange = function () {
            if (ddl_state.value !== '' && ddl_city.value !== '') {
                var locationValue = ddl_state.value + ' - ' + ddl_city.value;
                for (li = 0; li < stateCityDealers['cityStates'].length; li++) {
                    if (stateCityDealers['cityStates'][li]['location'] == locationValue) {
                        for (di = 0; di < stateCityDealers['cityStates'][li]['dealers'].length; di++) {
                            var dealer = stateCityDealers['cityStates'][li]['dealers'][di];
                            if (dealer.name === ddl_dealers.value) {
                                dealerCode.value = dealer.code;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }

        

    }
}());



(function () {

    window.setTimeout(function () {

        var targetForm = document.getElementById('dragonflyform');
        if (targetForm) {            
            targetForm.onsubmit = function () {
                var ddlState = document.getElementById('dealer-by-statecity-state');
                var ddlCity = document.getElementById('dealer-by-statecity-city');
                var dataState = document.getElementById('ddl-mapping-state');
                var dataCity = document.getElementById('ddl-mapping-city');
                if (ddlState && ddlCity && dataState && dataCity) {
                    var jsonState = JSON.parse(dataState.innerHTML);
                    var jsonCity = JSON.parse(dataCity.innerHTML);
                    var state_val = jsonState[ddlState.value];
                    var city_val = jsonCity[ddlCity.value];
                    if (state_val) {
                        var opt = ddlState.options[ddlState.selectedIndex];
                        if (opt) {
                            opt.value = state_val;
                            ddlState.value = state_val;
                        }
                    }
                    if (city_val) {
                        var opt = ddlCity.options[ddlCity.selectedIndex];
                        if (opt) {
                            opt.value = city_val;
                            ddlCity.value = city_val;
                        }
                    }
                }
            };
        }

    }, 500);

}());


var ddlState = $('#dealer-by-statecity-state');
var ddlCity = $('#dealer-by-statecity-city');
var isPostBack = false;

if ($('#ddl-mapping-state').length > 0 && $('#ddl-mapping-city').length > 0 && ddlState.length > 0 && ddlCity.length > 0) {
    var mappingConfig_state = $('#ddl-mapping-state').embeddedData();
    var mappingConfig_city = $('#ddl-mapping-city').embeddedData();
    $('form#dragonflyform').on('submit', function () {
        var state_val = mappingConfig_state[ddlState.val()];
        var city_val = mappingConfig_city[ddlCity.val()];
        if (state_val) {
            updateDDLValue(ddlState, state_val);
        }
        if (city_val) {
            updateDDLValue(ddlCity, city_val);
        }
    });
}
function updateDDLValue($ddl, value) {
    var opt = $ddl.find('option[value=' + $ddl.val() + ']');
    if (opt.length > 0) {
        opt[0].value = value;
        $ddl.val(value);
    }
}

if (!document.getElementsByClassName) {

    document.getElementsByClassName = function (classname) {
        var elArray = [];

        var tmp = document.getElementsByTagName("*");

        var regex = new RegExp("(^|\\s)" + classname + "(\\s|$)");
        for (var i = 0; i < tmp.length; i++) {

            if (regex.test(tmp[i].className)) {
                elArray.push(tmp[i]);
            }
        }

        return elArray;

    };
}

window.setTimeout(function () {
    var checkboxes = document.getElementsByClassName('checkAlt');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].setAttribute('checked', 'checked');
    }
}, 500);