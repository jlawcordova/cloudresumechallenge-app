import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { hash } from "./hashUtil.mjs";

const Region = "ap-southeast-1";
export const dynamoDBClient = new DynamoDBClient({ region: Region });

export async function hasVisitorViewed(ip) {
  const params = {
    TableName: "Visitor",
    Key: {
      IP: { S: hash(ip) },
    },
  };
  const data = await dynamoDBClient.send(new GetItemCommand(params));
  return data.Item != null;
}

export async function putVisitor(ip) {
  const params = {
    TableName: "Visitor",
    Item: {
      IP: { S: hash(ip) },
      ViewedOn: { S: new Date().toISOString() },
    },
  };
  await dynamoDBClient.send(new PutItemCommand(params));
}

export async function getViewCount(resumeId) {
  const params = {
    TableName: "ViewCount",
    Key: {
      Id: { S: resumeId },
    },
  };
  const data = await dynamoDBClient.send(new GetItemCommand(params));
  return data.Item.ViewCount.N;
}

export async function incrementViewCount(resumeId) {
  const params = {
    TableName: "ViewCount",
    Key: {
      Id: { S: resumeId },
    },
    UpdateExpression: "ADD ViewCount :n",
    ExpressionAttributeValues: {
      ":n": { N: "1" },
    },
    ReturnValues: "UPDATED_NEW",
  };
  const data = await dynamoDBClient.send(new UpdateItemCommand(params));
  return data.Attributes.ViewCount.N;
}
