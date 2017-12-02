#!/usr/bin/env bash.origin.script

depend {
    "server": "@com.github/bash-origin/bash.origin.express#s1"
}

echo ">>>TEST_IGNORE_LINE:^127\.<<<"

BO_cecho "TODO: Request page in browser and close browser." RED

CALL_server run {
    "routes": {
        "^/": {
            "@it.pinf.org.mochajs#s1": {
                "exit": true,
                "tests": {
                    "01-HelloWorld": function /* CodeBlock */ () {

                        describe('Array', function () {
                            describe('#indexOf()', function () {

                                it('should return -1 when the value is not present', function () {
                                    chai.assert.equal(-1, [1,2,3].indexOf(4));
                                });
                            });
                        });
                    }
                }
            }
        }
    }
}

echo "OK"
