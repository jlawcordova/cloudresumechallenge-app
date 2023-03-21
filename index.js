import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const Region = "ap-southeast-1";
var dynamoDBClient = new DynamoDBClient({ region: Region });

async function hasVisitorViewed(ip) {
  const params = {
    TableName: "Visitor",
    Key: {
      IP: { S: ip },
    },
  };
  const data = await dynamoDBClient.send(new GetItemCommand(params));

  if (data.Item != null) {
    // Visitor has already viewed the resume if they have a record
    // within the last day.
    var viewedOn = new Date(data.Item.ViewedOn.S);
    const msDiff = Math.abs(new Date() - new Date(viewedOn));
    const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));

    return daysDiff < 1;
  }

  return data.Item != null;
}

async function putVisitor(ip) {
  const params = {
    TableName: "Visitor",
    Item: {
      IP: { S: ip },
      ViewedOn: { S: new Date().toISOString() },
    },
  };
  await dynamoDBClient.send(new PutItemCommand(params));

  return;
}

async function getViewCount(resumeId) {
  const params = {
    TableName: "ViewCount",
    Key: {
      Id: { S: resumeId },
    },
  };
  const data = await dynamoDBClient.send(new GetItemCommand(params));

  return data.Item.ViewCount.N;
}

async function incrementViewCount(resumeId) {
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

export const handler = async (event) => {
  const ip = event.headers["X-Forwarded-For"].split(", ")[0];
  const hasViewed = await hasVisitorViewed(ip);

  let viewCount;
  const resumeId = "26c89138-35c6-4446-ae91-da38a5252ad1";

  // Only retrieve the view count if the user has already
  // viewed the resume.
  if (hasViewed) {
    viewCount = await getViewCount(resumeId);

    let response = {
      statusCode: 200,
      body: JSON.stringify({
        viewCount: viewCount,
      }),
    };
    return response;
  }

  viewCount = await incrementViewCount(resumeId);
  await putVisitor(ip);

  let response = {
    statusCode: 200,
    body: JSON.stringify({
      viewCount: viewCount,
    }),
  };
  return response;
};
