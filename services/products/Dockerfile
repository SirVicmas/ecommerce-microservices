# Base image — Alpine is a tiny Linux distro, keeps our image small
FROM node:18-alpine

# Create a working directory inside the container
WORKDIR /app

# Copy package.json first — before the app code
# Docker builds in layers — this layer only re-runs if dependencies change
COPY package.json .

# Install only production dependencies
RUN npm install --production

# Now copy the app code
COPY index.js .

# Tell Docker this container listens on port 3001
EXPOSE 3001

# Command that runs when container starts
CMD ["node", "index.js"]