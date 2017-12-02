
// Load CSS

const css = require("mocha/mocha.css");

// Load deps

const $ = require("jquery/dist/jquery.js");
const chai = require("chai/lib/chai.js");
require("mocha/index.js");
const mocha = window.mocha;

// Append to BODY

$('<div id="mocha"></div>').appendTo('BODY');

// Configure

mocha.setup('bdd');

// Declare tests

%%TESTS%%

// Run tests

mocha.checkLeaks();
mocha.globals(['jQuery']);
function logError (err) {
    console.error("mocha error:", err);
    $.ajax({
        type: "POST",
        url: "%%STOP_URL%%",
        data: JSON.stringify({
            "suite": "%%SUITE%%",
            "error": err.stack
        }),
        headers: {
            "Accept": "application/json; charset=utf-8",                     
            "Content-Type": "application/json; charset=utf-8"
        },
        dataType: "json"
    });
}
try {
    mocha.run()
        .on('error', logError)
        .on('fail', function (event) {

console.log("moacha fail:", "%%STOP_URL%%", event);

            if (window.__postJSON) {
                window.__postJSON("%%STOP_URL%%", {
                    "suite": "%%SUITE%%",
                    "failure": event.err
                });
            } else {
                $.ajax({
                    type: "POST",
                    url: "%%STOP_URL%%",
                    data: JSON.stringify({
                        "suite": "%%SUITE%%",
                        "failure": event.err
                    }),
                    headers: {
                        "Accept": "application/json; charset=utf-8",                     
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    dataType: "json"
                });
            }
        })
        .on('end', function () {

console.log("moacha done:", "%%STOP_URL%%", this.stats);

            if (window.__postJSON) {
                window.__postJSON("%%STOP_URL%%", {
                    "suite": "%%SUITE%%",
                    "stats": this.stats
                });
            } else {
                $.ajax({
                    type: "POST",
                    url: "%%STOP_URL%%",
                    data: JSON.stringify({
                        "suite": "%%SUITE%%",
                        "stats": this.stats
                    }),
                    headers: {
                        "Accept": "application/json; charset=utf-8",                     
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    dataType: "json"
                });
            }            
        });
} catch (err) {
    logError(err);
}