import { memo, useCallback } from "react";
import { toast } from "react-toastify";
import { LatexDisplay } from "../latex_display";
import BoxIcon from "../box_icon";

type SampleIODisplayProps = {
  sampleIndex: number;
  input: string;
  output: string;
  explanation: string | undefined;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
export const SampleIODisplay = memo(
  ({ sampleIndex, input, output, explanation }: SampleIODisplayProps) => {
    return (
      <div className="flex flex-col gap-4 mt-8">
        <SampleFileDisplay label={`Sample Input ${sampleIndex + 1}`} content={input} />
        <SampleFileDisplay label={`Sample Output ${sampleIndex + 1}`} content={output} />
        {explanation ? (
          <div>
            <h3 className="text-2xl font-bold mb-2">Explanation</h3>
            <LatexDisplay>{explanation}</LatexDisplay>
          </div>
        ) : null}
      </div>
    );
  }
);

type SampleFileDisplayProps = {
  label: string;
  content: string;
};

// eslint-disable-next-line react/display-name -- pre-existing error before eslint inclusion
const SampleFileDisplay = memo(({ label, content }: SampleFileDisplayProps) => {
  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    toast(`${label} copied to clipboard!`, { type: "success" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4">
        <h3 className="text-2xl font-bold">{label}</h3>
        <button type="button" className="flex" onClick={copyToClipboard}>
          <BoxIcon
            name="bxs-copy"
            className="bx-sm text-gray-300 hover:text-gray-500 self-center"
          />
        </button>
      </div>
      <pre className="text-sm bg-gray-150 border border-gray-250 rounded-md p-2.5 [letter-spacing:0.001em]">
        {content}
      </pre>
    </div>
  );
});
