FROM oven/bun:1.1 AS build

RUN mkdir -p C:\Users\Sistemas2\Documents\GitHub\test_app\app

COPY . C:\Users\Sistemas2\Documents\GitHub\test_app\app

EXPOSE 3000

CMD ["bun", "run", "dual"]