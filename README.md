# Hacker News App
This is a Node Server side app that consumes the Hacker News API to do some basic word analysis.

## Dev Dependencies
1. commitizen - for standardised git commit messages
2. nodemon - for watching file changes and restart the server
3. Node 16 (tested on here only)

## How to run
1. Git clone the repo
```bash
git clone git@github.com:JohnAdamsy/hacker-news-app.git
```

2. Go into the route directory and install dependencies
```bash
cd hacker-news-app
npm install
```

3. Start the App
> In Production
```bash
npm start
```
> In Development Mode
```bash
npm run start-dev
```

### APIs
#### 1. Top 10 most occurring words in the titles of the last 25 stories
Endpoint:
```
GET http://localhost:6500/words/occurrences
```
#### Sample Response
```json
{
    "data": {
        "to": 7,
        "a": 7,
        "on": 6,
        "the": 4,
        "from": 3,
        "crisis": 3,
        "in": 3,
        "of": 3,
        "hn:": 3,
        "how": 3
    }
}
```

> Also supports optional request params: topWordsCount, lastStoryCount
```
GET http://localhost:6500/words/occurrences?topWordsCount=5&lastStoryCount=50
```

### Challenges
1. Task 2: The Hacker News API for recent stories **/newstories** returns **null** when filtering with the range startAt and endAt. As a worker around, decided to fetch all stories (best, top, new, ask, show, job) get details and filter by the time it was created. 
2. Task 3: The Hacker News API has a limit of 500 items per result. As a worker around, decided to fetch all stories (best, top, new, ask, show, job) sort the index in reverse order and pick the first 600 then process from there. 

## To Do
1. Add Tests
2. Docker support
3. CI/CD Pipeline Configs

## Hacker News API
1. Retrieving last N stories 
```code
GET https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty&limitToLast=N&orderBy="$key"
```
