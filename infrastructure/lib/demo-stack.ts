import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';

export class DemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DemoFargateTask');

    taskDefinition.addContainer('DemoContainer', {
      image: ecs.ContainerImage.fromAsset('../', { exclude: ['cdk*'] }),
      memoryLimitMiB: 512,
    });
  }
}