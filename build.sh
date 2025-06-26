#!/usr/bin/env bash

apt-get update && apt-get install -y \
  portaudio19-dev \
  gcc \
  python3-dev

pip install -r requirements.txt
