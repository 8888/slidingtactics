<!doctype html>
    <head>
        <title>Sliding Tactics</title>
        <style>
            canvas.cnvs {
                outline: none;
                position: absolute;
                left: 0px;
                top: 0px;
            }
        </style>
    </head>
    <body>
        <table id="debugMenu" style="border-spacing: 6px; display: none;"><tr>
            <td><a href='?'>01x01=0001</a></td>
            <td><a href='?x=3&y=1'>03x01=0003</a></td>
            <td><a href='?x=4&y=2'>04x02=0008</a></td>
            <td><a href='?x=5&y=2'>05x02=0010</a></td>
            <td><a href='?x=6&y=3'>06x03=0018</a></td>
            <td><a href='?x=20&y=10'>20x10=0200</a></td>
            <td><a href='?x=28&y=15'>28x15=0420</a></td>
            <td><a href='?x=50&y=25'>50x25=1250</a></td>
            <td></td>
            <td><a onclick='javascript:hideElement("cnvsForeground");'>[Fore Canvas]</a></td>
            <td><a onclick='javascript:hideElement("cnvsBackground");'>[Back Canvas]</a></td>
            <td><a onclick='javascript:hideElement("cnvsDebug");'>[Debu Canvas]</a></td>
            <td></td>
            <td><a id='commandNorm'>[Norm Commands]</a></td>
            <td><a id='commandFast'>[Fast Commands]</a></td>
        </tr></table>
        <div id="canvasContainer" style='position: relative;'>
            <canvas id="cnvsForeground" width="1400" height="750" oncontextmenu="return false;" class="cnvs" style="z-index: 2;"></canvas>
            <canvas id="cnvsBackground" width="1400" height="750" oncontextmenu="return false;" class="cnvs" style="z-index: 1; background-color: #999;"></canvas>
            <canvas id="cnvsDebug" width="1400" height="100" oncontextmenu="return false;" class="cnvs" style="z-index: 3; top: 650px; display: none;"></canvas>
        </div>
        <div id="dimmer" style="margin: auto;position: absolute;z-index: 9;background-color: rgba(199, 52, 52, 0.34);width: 100%;top: 0px;height: 100%;left: 0px;">
            <div id="user" style="margin: auto;position: absolute;z-index: 10;background-color: lightslategray;width: 270px;top: 250px;left: 500px;">
                Sliding Tactics:<br/>
                To keep your stats and train your skill, please login or create an account:<br/>
                <table>
                    <tr><td>Handle:&nbsp;</td><td><input id="name" /></td></tr>
                    <tr><td>Credentials:&nbsp;</td><td><input id="answer" type="password" /></td></tr>
                    <tr><td colspan='2'>&nbsp;</td></tr>
                    <tr><td colspan='2' style="text-align: center;"><button onclick='javascript:login();'>Login / Register</button></td></tr>
                    <tr><td colspan='2'><span id="response">&nbsp;</span></td></tr>
                    <tr><td colspan='2' style="text-align: center;"><button onclick='javascript:onGuestPlay();'>Play as Guest</button></td></tr>
                </table>
            </div>
        </div>
        <script type="text/javascript" src="bundle.js"></script>
        <script>
            location.search.substr(1).split("&").forEach(function(p) {
                if (p == "debug") {
                    hideElement("debugMenu");
                    hideElement("cnvsDebug");
                }
            });

            function hideElement(id) {
                document.getElementById(id).style.display = 
                    document.getElementById(id).style.display == "none" ?
                    "inline" : "none";
            }

            function login() {
                let params = "un="+document.getElementById('name').value+"&an="+document.getElementById('answer').value;
                let xhr = new XMLHttpRequest();
                xhr.open("POST", "https://tactics.prototypeholdings.com/xlogin.php?action=authenticate", true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        console.log("<Request: '"+params+"'");
                        console.log("<Response: '"+xhr.responseText+"'");
                        if (xhr.responseText == "not authorized") {
                            localStorage.clear();
                        } else {
                            let user = JSON.parse(xhr.responseText);
                            if (user.valid) {
                                localStorage.setItem('user_key', user.user_key);
                                localStorage.setItem('user_name', user.username);
                                localStorage.setItem('user_is_authenticated', user.is_authenticated);
                                localStorage.setItem('user_is_first', user.is_first);
                                localStorage.setItem('user_is_active', user.is_active);
                                localStorage.setItem('user_token', user.token);
                            } else {
                                localStorage.clear();
                                document.getElementById('response').innerHTML = 'Incorrect password';
                            }
                        }
                    }
                };

                console.log(">Request: '"+params+"'");
                xhr.send(params);
            }
        </script>
    </body>
</html>