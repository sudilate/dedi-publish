import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TruncatedTextProps {
  text: string | undefined | null;
  maxLength?: number;
  className?: string;
}

export function TruncatedText({ text, maxLength = 100, className = "" }: TruncatedTextProps) {
  // Handle undefined, null, or empty text
  const safeText = text || "";
  const shouldTruncate = safeText.length > maxLength;
  const truncatedText = shouldTruncate ? `${safeText.substring(0, maxLength)}...` : safeText;

  if (!shouldTruncate) {
    return <span className={className}>{safeText}</span>;
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
          <p className="whitespace-pre-wrap">{safeText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}