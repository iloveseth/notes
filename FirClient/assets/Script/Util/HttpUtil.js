require('whatwg-fetch');

const _ = require('lodash');
const DEFINE = require('./Define');

let HttpUtil = {
    HTTPPost: function (url, params, callback, catchCallback, extra) {
        //create query
        var bodyparams = {};
        for (var param in params) {
            bodyparams[param] = params[param];
        }
        HttpUtil.HttpRequest('POST', 'json', url, bodyparams, callback, catchCallback, extra);
    },
    HttpRequest: function (type, dataType, url, params, callback, catchCallback, extra) {
        var xhr = new XMLHttpRequest();
		xhr.open(type,url,true);
        var data;
        if(dataType == "formdata")
        {
			data = new FormData();
			data.append("key","value");
        }
        else if(dataType == "json")
        {
			// xhr.setRequestHeader("Content-Type","application/json");
			data = JSON.stringify(params);
        }
        else if(dataType == "text")
        {
			data = "key=value";
        }
        else if(dataType == "www")
        {
		    // 这个header 其实是 传统post 表单的格式
			xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			data = "key=value";
        }

        xhr.onreadystatechange = function (response)
        {
            if (xhr.readyState == 4)
            {
                if (xhr.status == 200)
                {
                    if (_.isFunction(callback)) {
                        callback(JSON.parse(xhr.response), extra);
                    }
                }
                else
                {
                    if (_.isFunction(catchCallback)) {
                        catchCallback(responseJson, extra);
                    }
                    cc.log("Problem retrieving XML data");
                }
            }
        }
		xhr.send(data);
        return;
        let fetchParam = {};
        fetchParam = {
            method: type,
            // headers: {
            //     'content-type': 'application/json',
            // },
            body: JSON.stringify(params)
        };
        var status = 200;
        let shouldRet = false;
        fetch(url, fetchParam)
            .then((response) => {
                status = response.status;
                switch (response.status) {
                    case 200: {
                        return response.json();
                    }
                    case 204: {
                        shouldRet = true;
                        callback(null, extra);
                        break;
                    }
                    default: {
                        return response.json();
                    }
                }
            }).then((responseJson) => {
                if (shouldRet) {
                    return;
                }
                if (status == 200 || status == 204) {
                    callback(responseJson, extra);
                }
                else {
                    if (_.isFunction(catchCallback)) {
                        catchCallback(responseJson, extra);
                    }
                }
            })
            .catch((error) => {
                alert(error);
            });
    }
};

module.exports = HttpUtil;