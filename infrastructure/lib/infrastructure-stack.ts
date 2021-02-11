import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { Duration } from "@aws-cdk/core";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const tableName: string = "simpleApi.table";

    const dynamoTable = new dynamodb.Table(this, "SimpleApiItemsTable", {
      partitionKey: {
        name: "user_id",
        type: dynamodb.AttributeType.STRING,
      },
      tableName: tableName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const putUserLambda = new lambda.Function(this, "putUserFunction", {
      code: new lambda.AssetCode("lambda"),
      handler: "putUser.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(15),
      environment: {
        TABLE_NAME: dynamoTable.tableName,
      },
    });

    dynamoTable.grantReadWriteData(putUserLambda);

    const api = new apigateway.RestApi(this, "simpleUserApi", {
      restApiName: "Simple User Service",
    });
    const usersApi = api.root.addResource("users");

    const putUserLambdaIntegration = new apigateway.LambdaIntegration(
      putUserLambda
    );
    usersApi.addMethod("POST", putUserLambdaIntegration);
    addCorsOptions(usersApi);
  }
}

export function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
