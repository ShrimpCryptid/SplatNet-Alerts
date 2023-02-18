import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";

export const lambdaHandler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    return {
      statusCode: 200,
      body: "Hello World!"
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: "Error"
    }
  }
}