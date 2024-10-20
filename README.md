# CDK Remote Build

I noticed that some of my CDK deployments for work services would take a very long time to push locally-built Docker images.

This is an experiment to try having CDK build docker images in an AWS EC2 instance, to shift this network traffic into being all within AWS.


## Usage

1. Deploy the `DeploymentStack`
    `cdk deploy DeploymentStack`

### TCP-Specific

2. Using the DNS name it spits out, try deploying with
    `DOCKER_HOST=tcp://$EC2_DNS_NAME:2375 cdk deploy InfrastructureStack`
    
    This is a normal CDK deployment, but with the infrastructure stack built on the remote host.

### SSH-Specific

Using SSH to connect to the remote Docker context is more secure than TCP, and should be preferred.

#### Configuring SSH Agent

You need to make sure your SSH agent has access to the SSH key for the EC2 instance. Docker will use the system's SSH agent.

**WSL Note:** If you're running something like WSL with `ssh` aliased to `ssh.exe` (the host's SSH agent) to take advantage of 1PW SSH agent forwarding, Docker will use the WSL SSH agent, NOT the aliased host agent! In that case, you'll need to add the ec2 key to the system SSH config, not 1PW.

Test your SSH connection to the remote build host:
    `$> ssh <EC2_DNS_NAME>`
If this works, you should be good to go.

**Note:** You may need to do `ssh ec2-user@$EC2_DNS_NAME`, depending on how you have SSH configured. Creating an entry in `~/.ssh/config` like
```ssh-config
Host ec2-docker-remote
        User ec2-user
        IdentityFile /path/to/ec2/keyfile.pem
        HostName $EC2_DNS_NAME
```
is easiest IMO, and then you can just specify `ssh://ec2-docker-remote` everywhere instead of `ssh://$EC2_DNS_NAME`.

#### Remote builds with SSH

Similarly to TCP, this can be done with
```bash
$> DOCKER_HOST=ssh://$EC2_DNS_NAME docker build . 
```

## Creating a Docker context

Rather than manually providing `DOCKER_HOST`, you can create a Docker context that you can switch to. That makes it easy to swap in and out of remote/local contexts.


1. Create a context for the remote build

```bash
$> docker context create \
    --docker host=ssh://$EC2_DNS_NAME \
    --description="EC2 build host" \
    ec2-build-host
```

2. Activate it

```bash
$> docker context use ec2-build-host
```

3. Build with it

```bash
$> docker build .
```

## CDK deployment with the remote context

Having CDK use the remote build context is as easy as:
```bash
$> docker context use ec2-build-host
$> cdk deploy DeploymentStack
```
    
## Checking the remote build context is used

In case you want to confirm the build is correctly happening on the remote, I like to just disable the local Docker service, which will prevent building locally.

```bash
$> sudo service docker stop 
 * Stopping Docker: docker

# Only necessary if you switched to the remote context
$> docker context use default

$> cd cdk-remote-deploy

$> docker build .
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?

$> docker context use ec2-build-host
$> docker build .docker build .

Sending build context to Docker daemon  7.168kB
Step 1/4 : FROM node:14
# ... The usual Docker output ...
Successfully built ec1f33cd6eaa
```