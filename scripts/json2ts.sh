#!/bin/bash

sed -i '' 's/"allOf"/"x-allOf"/g' scripts/schemas/*.json

json2ts --no-additionalProperties -i scripts/schemas/ -o src/data/gen/

sed -i '' 's/"x-allOf"/"allOf"/g' scripts/schemas/*.json
