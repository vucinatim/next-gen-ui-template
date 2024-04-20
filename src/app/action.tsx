import { OpenAI } from "openai";
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  render,
  StreamableValue,
} from "ai/rsc";
import { z } from "zod";
import { ChatCompletionMessageParam } from "ai/prompts";

interface FlightInfo {
  readonly flightNumber: string;
  readonly departure: string;
  readonly arrival: string;
}

interface FlightCardProps {
  readonly flightInfo: FlightInfo;
}

type ContentType = string | OpenAI.Chat.Completions.ChatCompletionContentPart[];

type AIStateItem =
  | {
      readonly role: "user" | "assistant" | "system";
      readonly content: ContentType;
    }
  | {
      readonly role: "function";
      readonly content: ContentType;
      readonly name: string;
    };

interface UIStateItem {
  readonly id: number;
  readonly display: React.ReactNode;
  readonly progressState?: StreamableValue<
    {
      isLoading: boolean;
      isStreaming: boolean;
    },
    any
  >;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getFlightInfo(flightNumber: string): Promise<FlightInfo> {
  return {
    flightNumber,
    departure: "New York",
    arrival: "San Francisco",
  };
}

function Spinner() {
  return <div>Loading...</div>;
}

function FlightCard({ flightInfo }: FlightCardProps) {
  return (
    <div>
      <h2>Flight Information</h2>
      <p>Flight Number: {flightInfo.flightNumber}</p>
      <p>Departure: {flightInfo.departure}</p>
      <p>Arrival: {flightInfo.arrival}</p>
    </div>
  );
}

async function submitUserMessage(
  userInput: string,
  imageUrl?: string
): Promise<UIStateItem> {
  "use server";

  const content: ContentType = imageUrl
    ? [
        { type: "text", text: userInput },
        { type: "image_url", image_url: { url: imageUrl } },
      ]
    : userInput;

  const progressState = createStreamableValue({
    isLoading: true,
    isStreaming: true,
  });

  const aiState = getMutableAIState<typeof AI>();

  aiState.update([...aiState.get(), { role: "user", content: content }]);

  const ui = render({
    model: "gpt-4-turbo",
    provider: openai,
    messages: [
      { role: "system", content: "You are a flight assistant" },
      {
        role: "user",
        content: content,
      },
      ...(aiState.get() as ChatCompletionMessageParam[]),
    ],
    text: ({ content, done }) => {
      if (done) {
        aiState.done([...aiState.get(), { role: "assistant", content }]);
        progressState.done({ isLoading: false, isStreaming: false });
      }

      return (
        <div>
          <p>{content}</p>
          {/* Add a loading spinner if the response is not done */}
          {!done && <div>Loading...</div>}
        </div>
      );
    },
    tools: {
      get_flight_info: {
        description: "Get the information for a flight",
        parameters: z
          .object({
            flightNumber: z.string().describe("the number of the flight"),
          })
          .required(),
        render: async function* ({ flightNumber }) {
          yield <Spinner />;

          const flightInfo = await getFlightInfo(flightNumber);

          aiState.done([
            ...aiState.get(),
            {
              role: "function",
              name: "get_flight_info",
              content: JSON.stringify(flightInfo),
            },
          ]);
          progressState.done({ isLoading: false, isStreaming: false });

          return <FlightCard flightInfo={flightInfo} />;
        },
      },
    },
  });

  return { id: Date.now(), display: ui, progressState: progressState.value };
}

const initialAIState: AIStateItem[] = [];
const initialUIState: UIStateItem[] = [];

export const AI = createAI({
  actions: { submitUserMessage },
  initialUIState,
  initialAIState,
});
