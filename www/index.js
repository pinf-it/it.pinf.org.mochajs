
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
mocha.run()
    .on('error', function (err) {
        console.error(err);
    })
    .on('end', function () {
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
    });
