# Use the official Node.js 14 image as a base
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# # Copy package.json and package-lock.json to the working directory
# COPY project/package*.json ./

# # Install the application dependencies
# RUN npm install

# # Copy the rest of the application code to the working directory
# COPY project/ .

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["node", "app.js"]