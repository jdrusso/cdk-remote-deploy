import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as dotenv from 'dotenv';

dotenv.config();

export class RemoteBuildStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'RemoteBuildVpc', { maxAzs: 1 });

    const securityGroup = new ec2.SecurityGroup(this, 'RemoteBuildSecurityGroup', {
      vpc,
      description: 'Allow SSH access',
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access');

    const instance = new ec2.Instance(this, 'RemoteBuildInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup,
      keyName: process.env.EC2_KEYPAIR_NAME,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    instance.addUserData(
      `#!/bin/bash`,
      `yum update -y`,
      `yum install -y docker`,
      `service docker start`,
      `usermod -a -G docker ec2-user`
    );

    new cdk.CfnOutput(this, 'RemoteBuildInstancePublicDNS', {
      value: instance.instancePublicDnsName,
      description: 'The public DNS of the EC2 instance',
    });
  }
}
