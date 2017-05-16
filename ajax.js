'use strict';
//// COPY FROM MODEL WITHOUT module.exports
let ajax = {};

ajax.isProduction = location.href.indexOf('/tactics.prototypeholdings.com/') !== -1;
ajax.locationProduction = 'https://tactics.prototypeholdings.com/x/';
ajax.isTesting = location.href.indexOf('/devtactics.prototypeholdings.com/') !== -1;
ajax.locationTesting = 'https://devtactics.prototypeholdings.com/x/';
ajax.locationLocal = '//localhost:61588/x/';

ajax.promise_post = function(destination, parameters) {
    if (ajax.isProduction) {
        destination = ajax.locationProduction + destination;
    } else {//if (ajax.isTesting) {
        destination = ajax.locationTesting + destination;
    }// else {
    //    destination = ajax.locationLocal + destination
    //}

    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", destination, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onload = function() {
            if (xhr.status == 200) {
                if (xhr.responseText == "not authorized") {
                    reject("not authorized");
                } else if (resolve) {
                    if (xhr.responseText !== "") {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        resolve();
                    }
                }
            }
        };
        xhr.onerror = function() { reject("Network Issue"); };
        xhr.send("token="+localStorage.getItem('user_token')+"&"+parameters);
    });
};