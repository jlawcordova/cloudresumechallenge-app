import {
  hasVisitorViewed,
  putVisitor,
  getViewCount,
  incrementViewCount,
} from "./dynamoDb.mjs";

export const handler = async (event) => {
  const ip = event.requestContext.http.sourceIp;
  const hasViewed = await hasVisitorViewed(ip);

  let viewCount;
  const resumeId = "26c89138-35c6-4446-ae91-da38a5252ad1";

  if (hasViewed) {
    viewCount = await getViewCount(resumeId);
  } else {
    viewCount = await incrementViewCount(resumeId);
    await putVisitor(ip);
  }

  let response = {
    statusCode: 200,
    body: JSON.stringify({
      viewCount: viewCount,
    }),
  };
  return response;
};
