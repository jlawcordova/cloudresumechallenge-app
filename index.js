import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const Region = "ap-southeast-1";
var dynamoDBClient = new DynamoDBClient({ region: Region });

function hasVisitorViewed() {
  return true;
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
  const hasViewed = await hasVisitorViewed();

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

  let response = {
    statusCode: 200,
    body: JSON.stringify({
      viewCount: viewCount,
    }),
  };
  return response;
};
