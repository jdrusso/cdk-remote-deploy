import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class DemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'DemoVpc', { maxAzs: 1 });

    const cluster = new ecs.Cluster(this, 'DemoCluster', {
      vpc: vpc,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DemoFargateTask');

    const container = taskDefinition.addContainer('DemoContainer', {
      image: ecs.ContainerImage.fromAsset('../', { exclude: ['cdk*'] }),
      memoryLimitMiB: 512,
    });

    new ecs.FargateService(this, 'DemoFargateService', {
      cluster: cluster,
      taskDefinition: taskDefinition,
    });
  }
}
