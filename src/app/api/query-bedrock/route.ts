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
    // Assuming chunk contains a Uint8Array or buffer-like object
    result += decoder.decode(chunk, { stream: true });
  }

  // Finalize decoding
  result += decoder.decode();
  return result;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { input } = await req.json();

    if (!input) {
      return new Response("Input is required", { status: 400 });
    }

    const client = new BedrockAgentRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });

    const command = new InvokeAgentCommand({
      agentId: "EYAKHASD7N", // Replace with your agent ID
      inputText: input,
      agentAliasId: "C9KSXNVZIA",
      sessionId: "1233",
    });

    const response = await client.send(command);

    const rawData = await streamToString(response.completion!);
    const parsedData = JSON.parse(rawData);

    return new Response(JSON.stringify(parsedData), { status: 200 });
  } catch (error: any) {
    console.error("Error invoking Bedrock:", error);
    return new Response(
      JSON.stringify({ message: "Bedrock invocation error", error: error.message }),
      { status: 500 }
    );
  }
}