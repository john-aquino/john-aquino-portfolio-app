import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { TextDecoder } from "util"; // Node.js text decoding

interface BedrockResponse {
  generatedText?: string;
  message?: string;
}

// Utility to consume the AsyncIterable stream
async function streamToString(stream: AsyncIterable<any>): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  let result = "";

  for await (const chunk of stream) {
    // Decode the chunk (assuming it's Uint8Array or buffer-like)
    if (chunk?.bytes) {
      result += decoder.decode(chunk.bytes, { stream: true });
    }
  }

  // Finalize decoding
  result += decoder.decode();
  return result;
}

export async function POST(req: Request): Promise<Response> {
  try {
    console.log("Headers:", req.headers);

    // Validate content type
    if (!req.headers.get("content-type")?.includes("application/json")) {
      return new Response("Invalid content type. Expected application/json.", { status: 400 });
    }

    // Parse the request body
    const body = await req.json();
    console.log("Parsed body:", body);

    // Validate the `input` field
    if (!body?.input || typeof body.input !== "string") {
      return new Response("Invalid input. Expected a JSON object with an 'input' field of type string.", { status: 400 });
    }

    // Initialize Bedrock Agent Runtime Client
    const client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });

    // Call the Bedrock agent with the user's input
    const command = new InvokeAgentCommand({
      agentId: "EYAKHASD7N",
      agentAliasId: "C9KSXNVZIA", 
      inputText: body.input,
      sessionId: body.sessionId ?? "default",
    });

    const response = await client.send(command);
    // Log the completion field to inspect its structure
    // console.log("Response completion field:", response.completion);

    if (response.completion === undefined) {
      throw new Error("Completion is undefined");
    }
    let completion = "";

    for await (const chunkEvent of response.completion) {
      const chunk = chunkEvent.chunk;
      // console.log(new TextDecoder("utf-8").decode(chunk?.bytes));
      const decodedResponse = new TextDecoder("utf-8").decode(chunk?.bytes);
      completion += decodedResponse;
    }

    console.log(completion)

    return new Response(completion) ;
    
  } catch (error: any) {
    console.error("Error invoking Bedrock:", error);
    return new Response(
      JSON.stringify({ message: "Bedrock invocation error", error: error.message }),
      { status: 500 }
    );
  }
}