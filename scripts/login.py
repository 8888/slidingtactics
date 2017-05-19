import json
import requests

def server_authenticate(username, password):
    ''' authenticates the user '''
    r = requests.post("https://tactics.prototypeholdings.com/x/login.php?action=authenticate", data={"un": username, "an": password})
    if r.text and r.status_code == 200:
        user = json.loads(r.text)
        if "token" in user:
            return user["token"]
        else:
            raise ValueError("Unable to parse response", r.text)
    else:
        raise ValueError("Malformed response", r.text, r.status_code, r.reason)
