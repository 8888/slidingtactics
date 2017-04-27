'use strict';

let ajax = {};

ajax.post_request = function(destination, parameters, responseFunction) {
    let params = "token="+localStorage.getItem('user_token')+"&"+parameters;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", destination, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            console.log("<Request: '"+destination+"' '"+params+"'");
            console.log("<Response: '"+xhr.responseText+"'");
            if (xhr.responseText == "not authorized") {
                localStorage.clear();
            } else if (responseFunction) {
                responseFunction(xhr.responseText);
            }
        }
    };

    console.log(">Request: '"+destination+"' '"+params+"'");
    xhr.send(params);
};

ajax.promise_post = function(destination, parameters) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", destination, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onload = function() {
            if (xhr.status == 200) {
                if (xhr.responseText == "not authorized") {
                    reject("not authorized");
                } else {
                    resolve(JSON.parse(xhr.responseText));
                }
            }
        };
        xhr.onerror = function() { reject("Network Issue"); };
        xhr.send("token="+localStorage.getItem('user_token')+"&"+parameters);
    });
};

module.exports = ajax;