FROM --platform=linux/arm64 amazon/aws-lambda-nodejs:18

# Create app directory
WORKDIR /usr/src/app

# Install zip
RUN yum install -y zip

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create deployment package
RUN zip -r deployment.zip . -x "*.git*" "Dockerfile" "*.md" "*.env*" "test/*"

# Set the entrypoint with handler
ENTRYPOINT ["/lambda-entrypoint.sh"]
CMD ["src/app.handler"]