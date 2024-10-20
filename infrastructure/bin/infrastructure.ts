#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DemoStack } from '../lib/demo-stack';
import { DeploymentStack } from '../lib/deployment-stack';

const app = new cdk.App();
new DemoStack(app, 'DemoStack', {});
new DeploymentStack(app, 'DeploymentStack', {});