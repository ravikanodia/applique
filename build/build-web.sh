#!/bin/bash
# TODO: This build script should be a lot better.

PROJECT_ROOT=`dirname $0`/..
TARGET_DIR=${PROJECT_ROOT}/target/web
echo "PROJECT_ROOT IS ${PROJECT_ROOT}"

mkdir -p ${TARGET_DIR}

cp ${PROJECT_ROOT}/web/main.html ${TARGET_DIR}
browserify ${PROJECT_ROOT}/web/app.js -o ${TARGET_DIR}/applique.js
