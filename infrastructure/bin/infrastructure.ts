#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { InfrastructureStack } from "../lib/infrastructure-stack";

const app = new cdk.App();
new InfrastructureStack(app, "SimpleCrudApiInfrastructure", {
  env: { account: "535707483867", region: "us-east-1" },
});
