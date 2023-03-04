import { DynamoDBClient, UpdateItemCommand }
    from "@aws-sdk/client-dynamodb";

const Region = "ap-southeast-1";
var ViewCountDynamoDBClient = new DynamoDBClient({ region: Region });

export const handler = async(event) => {
    const updateParams = {
        TableName: "ViewCount",
        Key: {
            Id: { S: "26c89138-35c6-4446-ae91-da38a5252ad1" },
        },
        UpdateExpression: "ADD ViewCount :n",
        ExpressionAttributeValues: {
            ":n": { N: "1" } ,
        },
        ReturnValues: "UPDATED_NEW",
    };
    const data = await ViewCountDynamoDBClient
        .send(new UpdateItemCommand(updateParams));

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            "viewCount": data.Attributes.ViewCount.N
        }),
    };

    return response;
};
