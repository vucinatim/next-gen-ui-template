"use client";

import { useEffect, useState } from "react";
import { useUIState, useActions, useStreamableValue } from "ai/rsc";
import type { AI } from "./action";
import ChatInput from "@/components/chat-input";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions<typeof AI>();
  const [data, error, pending] = useStreamableValue(
    messages[messages.length - 1]?.progressState
  );

  useEffect(() => {
    console.log("messages", messages);
  }, [messages]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    imageUrl?: string
  ) => {
    e.preventDefault();

    // Add user message to UI state
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        display: <div>{inputValue}</div>,
      },
    ]);

    // Submit and get response message
    const responseMessage = await submitUserMessage(inputValue, imageUrl);
    setMessages((currentMessages) => [...currentMessages, responseMessage]);

    setInputValue("");
  };

  return (
    <div className="relative flex flex-col bg-gray-100 h-[100dvh] w-[100dvw]">
      <div className="overflow-y-scroll grow px-6 flex flex-col gap-y-6">
        <div className="flex-grow" />
        {
          // View messages in UI state
          messages.map((message) => (
            <div className="bg-white text-black" key={message.id}>
              {message.display}
            </div>
          ))
        }
        <div className="bg-yellow-300" />
      </div>

      <ChatInput
        multiModal
        isLoading={data?.isStreaming || false} // How can we get this?
        input={inputValue}
        handleSubmit={handleSubmit}
        handleInputChange={(event) => {
          setInputValue(event.target.value);
        }}
      />
    </div>
  );
}
