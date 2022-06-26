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

2. Go into the root directory and install dependencies
```bash
cd hacker-news-app && npm install
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

## Finished APIs
*Note:* Link to the [postman collection for the Hacker News App](postman_collection.json)
### 1. Top 10 most occurring words in the titles of the last 25 stories
Endpoint:
```
GET http://localhost:6500/words/occurrences
```
#### Sample Response
```json
{
    "data": {
        "to": 6,
        "the": 5,
        "s": 4,
        "hn": 4,
        "for": 3,
        "of": 3,
        "on": 3,
        "in": 3,
        "and": 2,
        "it": 2
    },
    "title": "Top 10 words from the last 25 stories"
}
```

> Also supports optional request params: topWordsCount, lastStoryCount
```
GET http://localhost:6500/words/occurrences?topWordsCount=5&lastStoryCount=50
```

### 2. Top 10 most occurring words in the titles of posts of exactly last week
Endpoint:
```
GET http://localhost:6500/words/occurrences/last-week
```
#### Sample Response
```json
{
    "data": {
        "the": 242,
        "hn": 168,
        "of": 166,
        "to": 165,
        "a": 165,
        "in": 116,
        "for": 113,
        "ask": 109,
        "and": 97,
        "is": 94
    },
    "title": "Top 10 words from posts of last week (2022-06-20 to 2022-06-26)"
}
```

> Also supports optional request params: topWordsCount
```
GET http://localhost:6500/words/occurrences?topWordsCount=5
```

### 3. Top 10 most occurring words from last 600 stories of users with karma above 600
Endpoint:
```
GET http://localhost:6500/words/occurrences/users
```
#### Sample Response
```json
{
    "data": {
        "the": 51,
        "a": 27,
        "of": 26,
        "to": 22,
        "s": 22,
        "in": 20,
        "and": 20,
        "is": 17,
        "for": 16,
        "on": 11
    },
    "title": "Top 10 words from last 600 stories of 170 users with at least 10000 karma"
}
```

> Also supports optional request params: topWordsCount,minUserKarma,lastStoryCount
```
GET http://localhost:6500/words/occurrences/users?topWordsCount=10&minUserKarma=5000&lastStoryCount=700
```


### Challenges / Workarounds
1. **Task 2:** The Hacker News API for recent stories **/newstories** returns **null** when filtering with the range startAt and endAt. As a worker around, decided to fetch all stories (best, top, new, ask, show, job) get details, remove duplicate stories and filter by the time it was created. 
2. **Task 3:** The Hacker News API has a limit of 500 items per result. As a worker around, decided to fetch all stories (best, top, new, ask, show, job), remove duplicate storires,  sort the index in reverse order and pick the first 600 then process only by users with a karma of above 10,000.
3. **General**: As words can be in both lower case and uppercase, to avoid miscounting, converted all words into lowercase. Ignoring whitespaces, digits and other "funny" characters.

## To Do
1. Add Tests
2. Docker support
3. CI/CD Pipeline Configs

## Hacker News API
1. Retrieving last N stories 
```code
GET https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty&limitToLast=N&orderBy="$key"
```
