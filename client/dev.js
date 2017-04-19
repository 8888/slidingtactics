'use strict';

let SlidingTacticsController = require('../client/index.js'),
    PlayField = require('../model/devPlayField.js');

class DevSlidingTacticsController extends SlidingTacticsController {

    playfieldAdd(containerElementId) {
        let pf = new PlayField(containerElementId, 20, 10);
        this.playfields.push(pf);
    }
}

module.exports = DevSlidingTacticsController;

/*
    document.getElementById('myBody').innerHTML = `
            <table id='debugMenu' style='border-spacing: 6px;'><tr>
                <td><a href='?'>01x01=0001</a></td>
                <td><a href='?x=3&y=1'>03x01=0003</a></td>
                <td><a href='?x=4&y=2'>04x02=0008</a></td>
                <td><a href='?x=5&y=2'>05x02=0010</a></td>
                <td><a href='?x=6&y=3'>06x03=0018</a></td>
                <td><a href='?x=20&y=10'>20x10=0200</a></td>
                <td><a href='?x=28&y=15'>28x15=0420</a></td>
                <td><a href='?x=50&y=25'>50x25=1250</a></td>
                <td></td>
                <td><a id='cF'>[Fore Canvas]</a></td>
                <td><a id='cB'>[Back Canvas]</a></td>
                <td><a id='cD'>[Debu Canvas]</a></td>
                <td></td>
                <td><a id='commandNorm'>[Norm Commands]</a></td>
                <td><a id='commandFast'>[Fast Commands]</a></td>
            </tr></table>` + document.getElementById('myBody').innerHTML;

    let hideElement = function(id) {
        document.getElementById(id).style.display = 
            document.getElementById(id).style.display == "none" ?
            "inline" : "none";
    };
    document.getElementById('cF').onclick = function() { hideElement('cnvsForeground'); };
    document.getElementById('cB').onclick = function() { hideElement('cnvsBackground'); };
    document.getElementById('cD').onclick = function() { hideElement('cnvsDebug'); };
*/