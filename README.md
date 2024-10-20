# CDK Remote Docker Build

Deploying Docker images as part of CDK stacks can be slow, especially when pushing locally-built images to AWS. This guide shows how to use an AWS EC2 instance to build Docker images remotely, speeding up deployment by keeping network traffic within AWS.

## Quick Start

### Step 1: Set Up an EC2 Key Pair
1. Create a key pair in the AWS EC2 console.
2. Copy `.env.sample` to `.env`, and update with your key pair's name.

### Step 2: Deploy the Deployment Stack
Run the following command to deploy the stack:
```bash
cdk deploy DeploymentStack
```
This will output the public DNS name of your EC2 instance (`$EC2_DNS_NAME`). You'll need this for the next steps.

### Step 3: Create a Docker Context for Remote Builds
Create a Docker context to use the EC2 instance as the build host:
```bash
docker context create \
  --docker host=ssh://$EC2_DNS_NAME \
  --description="EC2 build host" \
  ec2-build-host
```

### Step 4: Switch to the Remote Context
Activate the newly created context:
```bash
docker context use ec2-build-host
```

### Step 5: Build the Docker Image Remotely
Run the build command to build your Docker image on the EC2 instance:
```bash
docker build .
```

You are now building Docker images on your remote EC2 instance!

## CDK Deployment with Remote Context
To deploy a CDK stack using the remote context:
1. Switch to the remote Docker context:
   ```bash
   docker context use ec2-build-host
   ```
2. Deploy your stack:
   ```bash
   cdk deploy DemoStack
   ```
Now, CDK will use the remote EC2 instance for the Docker build during deployment.

## Troubleshooting

### Verify Remote Build Context
To confirm that the build is happening remotely:
1. Stop the local Docker service:
   ```bash
   sudo service docker stop
   ```
2. Switch back to the default Docker context and try building:
   ```bash
   docker context use default
   docker build .
   ```
   If Docker can't connect locally, you'll see an error.
3. Switch back to the remote context and retry the build:
   ```bash
   docker context use ec2-build-host
   docker build .
   ```
   You should see the usual Docker output, confirming the remote build.

### SSH Agent Configuration
Ensure your SSH agent has access to the EC2 instance's key, as Docker uses the system SSH agent.

**Note for WSL Users:** If using WSL with `ssh` aliased to `ssh.exe` for host-based SSH agents (e.g., 1Password), Docker will still use the WSL SSH agent. Add the EC2 key to your WSL SSH config.

Test your SSH connection to the EC2 instance:
```bash
ssh ec2-user@$EC2_DNS_NAME
```
To simplify SSH commands, add an entry to `~/.ssh/config`:
```ssh-config
Host ec2-docker-remote
  User ec2-user
  IdentityFile /path/to/ec2/keyfile.pem
  HostName $EC2_DNS_NAME
```
You can now use `ssh://ec2-docker-remote` instead of typing the full DNS name each time.
