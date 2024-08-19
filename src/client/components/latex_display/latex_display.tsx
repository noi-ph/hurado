import { memo } from "react";
import { renderLatex } from "common/latex";

type LatexDisplayProps = {
  className?: string;
  children: string;
};

export const LatexDisplay = memo(({ className, children }: LatexDisplayProps) => {
  const result = renderLatex(children);

  if ('error' in result) {
    const error = result.error as any;
    return (
      <div className="font-mono text-red-500">
        {error.message}
      </div>
    );
  }

  return (
    <div>
      {result.node}
    </div>
  );
});
