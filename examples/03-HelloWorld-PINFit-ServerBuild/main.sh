#!/usr/bin/env bash.origin.script

[ ! -e ".~" ] || rm -Rf .~*

echo ">>>TEST_IGNORE_LINE:^127\.<<<"
echo ">>>TEST_IGNORE_LINE:Waiting until program <<<"

pinf.it .

echo "OK"
