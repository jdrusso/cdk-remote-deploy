import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class DemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2 // Default is all AZs in the region
    });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'MyCluster', {
      vpc: vpc
    });

    // Define a task definition with a single container
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'MyTaskDef');

    // Add a container to the task definition using a custom Dockerfile
    const container = taskDefinition.addContainer('MyContainer', {
      image: ecs.ContainerImage.fromAsset('../',
        {exclude: ["cdk*"]}
      ), // Specify the path to your Dockerfile
      memoryLimitMiB: 512,
    });

    // Create a Fargate service
    new ecs.FargateService(this, 'MyFargateService', {
      cluster: cluster,
      taskDefinition: taskDefinition,
    });
  }
}