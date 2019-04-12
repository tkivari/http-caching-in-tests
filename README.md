# http-caching-in-tests

This repository is a simple demonstration of a couple of different methods of caching HTTP responses in Mocha tests that can help significantly reduce the time it takes to run a test suite if your application makes a lot of external HTTP requests.

## The three approaches outlined include:

### 1. Do nothing - test/1.server.test.js

This test simply makes some HTTP requests every time the test is run. This is the approach we normally take.

### 2. Nock Back - test/2.server.nock.test.js

This test uses the Nock library to intercept, record, and play back HTTP requests made from the test. The first time the test is run, the HTTP requests are made and their responses are recorded inside a fixture file. Subsequent runs of the test use the response data stored fixture files to inject the responses instead of actually making the HTTP requests, which dramatically reduces the time it takes to run the test.

Some downsides of this approach include

- the fixture files aren't easily shared between application instances. For example, when we push our branches remotely, the tests are run on individual instances that don't share files. This means that all instances are going to generate their own fixtures by making the HTTP requests. The test suite will run faster locally, but won't run quickly remotely unless we create a shared file system that each instance can use.
- the fixture files never expire, so we will never get a fresh response from the API unless we manually go in and delete the fixture files, or run a cron job to continually do so.
- As far as I have found, it is not possible to tell Nock which HTTP requests to intercept and which ones to ignore, so ALL requests in our tests would be intercepted and cached, including calls to our own API, which may not be ideal. We could probably work around this issue but there doesn't seem to be an easy way to do this.

### 3. Caching HTTP responses with Redis - test/3.server.redis.test

This test requires redis (`brew install redis` on a mac). This test will cache the response from an HTTP request in Redis the first time the test is run, and in subsequent runs, it will use the cached value from the Redis store. Cached values expire in 24 hours, so the tests will make the actual HTTP requests once a day to keep the cache fresh. This approach is fast and reliable, and multiple instances of the application can share the same Redis server easily.

One downside of this approach is that it won't intercept all HTTP requests made in the application in the same way that the Nock approach will, meaning that you will only be able to cache responses from HTTP requests made directly in the test itself, and not HTTP requests made from modules imported into the test. One workaround would be to implement the caching approach in each module individually, and only used cached values if the application is being run in a test context (determined by an environment variable), but this approach will pollute the codebase with a lot of context-specific logic.
