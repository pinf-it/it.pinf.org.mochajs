
const PATH = require("path");
const FS = require("fs");
const CODEBLOCK = require("codeblock");


exports.forConfig = function (CONFIG) {

    return {
        "#io.pinf/middleware~s1": function (API) {
            
            return function (req, res, next) {

                if (
                    req.method === "POST" &&
                    req.url === "/stop"
                ) {

                    process.stdout.write('>>>TEST_IGNORE_LINE:"(start|end|duration)": (".*Z"|[\\d]+),?\s*$<<<\n');
                    process.stdout.write("<RESULT>\n");
                    process.stdout.write(JSON.stringify(req.body, null, 4) + "\n");
                    process.stdout.write("</RESULT>\n");

                    if (req.body.stats.failures === 0) {
                        if (process.env.BO_TEST_FLAG_DEV) {
                            console.log("NOTE: Leaving browser open due to '--dev'.");
                        } else {
                            // Test success
                            API.SERVER.stop();
                        }
                    } else {
                        console.error("ERROR: Test failures!");
                    }

                    res.writeHead(200);
                    return res.end();
                }

                var page = FS.readFileSync(PATH.join(__dirname, "www/index.html"), "utf8");

                var tests = [];
                if (CONFIG.tests) {
                    Object.keys(CONFIG.tests).map(function (testName) {
                        var test = CODEBLOCK.compile(CONFIG.tests[testName]);

                        tests.push([
                            'describe("' + testName + '", function () {',
                                test.getCode(),
                            '})'
                        ].join("\n"));
                   });
                }

                page = page.replace(/%%TESTS%%/, tests.join("\n"));
                page = page.replace(/%%STOP_URL%%/, "/stop");

                res.writeHead(200, {
                    "Content-Type": "text/html"
                });
                
                res.end(page);
            };
        }
    }
}
