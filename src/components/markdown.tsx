import { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

export default function Markdown({ content }: { content: string }) {
  return (
    <MemoizedReactMarkdown
      className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words"
      remarkPlugins={[remarkGfm]}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
      }}
    >
      {content}
    </MemoizedReactMarkdown>
  );
}
