'use strict';

let ajax = {};

ajax.promise_post = function(destination, parameters) {
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

module.exports = ajax;