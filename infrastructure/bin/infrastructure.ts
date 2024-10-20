#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DemoStack } from '../lib/demo-stack';
import { RemoteBuildStack } from '../lib/remote-build-stack';

const app = new cdk.App();
new RemoteBuildStack(app, 'RemoteBuildStack', {});
new DemoStack(app, 'DemoStack', {});