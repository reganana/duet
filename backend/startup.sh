#!/bin/bash

set -e

if [ -d "venv" ]; then
    rm -rf venv
fi
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/pip install djangorestframework django-cors-headers
./venv/bin/python3 OneOnOne/csc309_duet/manage.py makemigrations
./venv/bin/python3 OneOnOne/csc309_duet/manage.py migrate
