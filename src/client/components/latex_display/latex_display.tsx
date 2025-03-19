import { memo } from "react";
import { renderLatex } from "common/latex";

type LatexDisplayProps = {
  className?: string;
  children: string;
};

// eslint-disable-next-line react/display-name, @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
export const LatexDisplay = memo(({ className, children }: LatexDisplayProps) => {
  const result = renderLatex(children);

  if ("error" in result) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pre-existing error before eslint inclusion
    const error = result.error as any;
    return <div className="font-mono text-red-500">{error.message}</div>;
  }

  return <div>{result.node}</div>;
});
