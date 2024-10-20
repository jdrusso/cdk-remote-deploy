#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { DeploymentStack } from '../lib/deployment-stack';

const app = new cdk.App();
new InfrastructureStack(app, 'InfrastructureStack', {});
new DeploymentStack(app, 'DeploymentStack', {});