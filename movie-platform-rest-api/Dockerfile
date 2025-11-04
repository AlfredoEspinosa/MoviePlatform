# Base image: light version of linux with nodejs v 22
FROM node:22-alpine

#Install git
RUN apk update && apk add git

#Set a working directory
WORKDIR /nodejs-challenge

#Clone project repository
RUN git clone https://github.com/AlfredoEspinosa/MoviePlatform.git

#Set to the project directory
WORKDIR /nodejs-challenge/MoviePlatform//movie-platform-rest-api

# Print current directory
RUN echo "Current directory:" && pwd
# List files in the current directory
RUN echo "Files in /movie-platform-rest-api:" && ls -la

#Install dependencies
RUN npm install

#Run migrate and seed to drop movie table and recreate It with first 10 records
RUN npm run migrate
RUN npm run seed

# Expose port for Node.js server
EXPOSE 3000/tcp

CMD ["npm", "start"]


