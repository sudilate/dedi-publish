import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function TruncatedText({ text, maxLength = 100, className = "" }: TruncatedTextProps) {
  const shouldTruncate = text.length > maxLength;
  const truncatedText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>
            {truncatedText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm">
          <p className="whitespace-pre-wrap">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}