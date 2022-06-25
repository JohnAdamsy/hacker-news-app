# Hacker News APP

## Dev Dependencies
1. commitizen - for standardised git commit messages

## Hacker News API
1. Retrieving last N stories 
```code
GET https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty&limitToLast=N&orderBy="$priority"
```
