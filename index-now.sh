#!/bin/bash

POST /IndexNow HTTP/1.1
Content-Type: application/json; charset=utf-8
Host: api.indexnow.org
{
  "host": "www.example.org",
  "key": "aa2f1bc47f4d4cb29ad318879de12258",
  "keyLocation": "https://eurekatop.com/e/index-now-aa2f1bc47f4d4cb29ad318879de12258.txt",
  "urlList": [
      "https://www.example.org/url1",
      "https://www.example.org/folder/url2",
      "https://www.example.org/url3"
      ]
}