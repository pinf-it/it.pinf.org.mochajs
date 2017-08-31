#!/usr/bin/env bash.origin.script

depend {
    "server": "@com.github/bash-origin/bash.origin.express#s1"
}

CALL_server run {
    "routes": {
        "/code.js": {
            "@it.pinf.org.mochajs#s1": {
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
