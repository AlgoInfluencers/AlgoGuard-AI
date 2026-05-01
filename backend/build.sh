#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Compiling C++ graph executable..."
g++ -O3 -o g graph.cpp

echo "Build complete!"
