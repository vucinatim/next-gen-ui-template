import { Message } from "ai/react";
import Markdown from "./markdown";

export default function ChatMessage(chatMessage: Message) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-1 justify-between gap-2">
        <div className="flex-1">
          <Markdown content={chatMessage.content} />
        </div>
      </div>
    </div>
  );
}
