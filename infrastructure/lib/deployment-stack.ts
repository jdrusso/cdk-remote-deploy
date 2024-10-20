import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class DeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'RemoteBuildVpc', {});

    const securityGroup = new ec2.SecurityGroup(this, 'RemoteBuildSecurityGroup', {
      vpc,
      description: 'Allow SSH access',
      allowAllOutbound: true
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access');;

    const instance = new ec2.Instance(this, 'RemoteBuildInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup,
      keyName: 'docker-build-ec2-keypair',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      }
    });

    instance.addUserData(
      `#!/bin/bash`,
      `yum update -y`,
      `yum install -y docker`,
      `service docker start`,
      `usermod -a -G docker ec2-user`,
      `curl -sL https://rpm.nodesource.com/setup_14.x | bash -`,
      `yum install -y nodejs`,
      `npm install -g aws-cdk`,
    );

    const role = new iam.Role(this, 'RemoteBuildInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccess'),
      ],
    });
    instance.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));    
    
    new cdk.CfnOutput(this, 'RemoteBuildInstancePublicDNS', {
      value: instance.instancePublicDnsName,
      description: 'The public DNS of the EC2 instance',
    });
  }
}