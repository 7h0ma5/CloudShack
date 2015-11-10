#!/bin/bash

TMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t 'cloudshack')
PACKAGE_DIR=${TMP_DIR}/cloudshack
mkdir -p ${PACKAGE_DIR}

pushd ${2:-"."}

cargo build --release || exit 1
ln -s $(pwd)/target/release/cloudshack ${PACKAGE_DIR}/cloudshack  || exit 1

pushd webapp
    npm run build || exit 1
popd

mkdir ${PACKAGE_DIR}/webapp || exit 1
ln -s $(pwd)/webapp/public/ ${PACKAGE_DIR}/webapp/public || exit 1

popd

echo "" > ${PACKAGE_DIR}/config.toml
curl http://www.cloudshack.org/dxcc.json.gz | gunzip > ${PACKAGE_DIR}/dxcc.json

tar czfh ${1:-cloudshack.tar.gz} -C ${TMP_DIR} cloudshack || exit 1

rm -rf ${TMP_DIR}
