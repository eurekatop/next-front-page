#!/bin/bash

curl -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "host": "www.eurekatop.com",
    "key": "aa2f1bc47f4d4cb29ad318879de12258",
    "keyLocation": "https://www.eurekatop.com/aa2f1bc47f4d4cb29ad318879de12258.txt",
    "urlList": [
    "https://www.eurekatop.com/ca/blog/de-la-musica-al-chatgpt",
    "https://www.eurekatop.com/ca/blog/la-memoria-digital",
    "https://www.eurekatop.com/ca/blog/no-obris-la-porta",
    "https://www.eurekatop.com/ca/blog/la-primera-web-i-futbol",
    "https://www.eurekatop.com/ca/blog/primera-llum-encesa",
    "https://www.eurekatop.com/ca/blog/vigila-els-secrets",
    "https://www.eurekatop.com/ca/blog",
    "https://www.eurekatop.com/ca/blog/categories",
    "https://www.eurekatop.com/es/blog/la-memoria-digital",
    "https://www.eurekatop.com/es/blog/no-abras-la-puerta",
    "https://www.eurekatop.com/es/blog/la-primera-web-y-futbol",
    "https://www.eurekatop.com/es/blog/primera-luz-encendida",
    "https://www.eurekatop.com/es/blog/vigila-los-secretos",
    "https://www.eurekatop.com/es/blog",
    "https://www.eurekatop.com/es/blog/categories",
    "https://www.eurekatop.com/en/blog/from-algorithmic-music-to-chatgpt",
    "https://www.eurekatop.com/en/blog/digital-memory",
    "https://www.eurekatop.com/en/blog/dont-open-the-door",
    "https://www.eurekatop.com/en/blog/the-first-web-and-football",
    "https://www.eurekatop.com/en/blog/first-light-on",
    "https://www.eurekatop.com/en/blog/watch-your-secrets",
    "https://www.eurekatop.com/en/blog",
    "https://www.eurekatop.com/en/blog/categories"
    ]
  }'




