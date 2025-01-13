import { memo } from "react";
import { LatexDisplay } from "../latex_display";
import { toast } from "react-toastify";
import BoxIcon from "../box_icon";

type SampleIODisplayProps = {
  sampleIndex: number;
  input: string;
  output: string;
  explanation: string | undefined;
};

export const SampleIODisplay = memo(({ sampleIndex, input, output, explanation }: SampleIODisplayProps) => {
  return (
    <div className="flex flex-col gap-4 mt-8">
      <SampleFileDisplay label={`Sample Input ${sampleIndex+1}`} content={input}/>
      <SampleFileDisplay label={`Sample Output ${sampleIndex+1}`} content={output}/>
      { explanation ? (
          <div>
            <h3 className="text-2xl font-bold mb-2">Explanation</h3>
            <LatexDisplay>
              { explanation }
            </LatexDisplay>
          </div>
        ) : null }
    </div>
  );
});

type SampleFileDisplayProps = {
  label: string;
  content: string;
};

const SampleFileDisplay = memo(({ label, content }: SampleFileDisplayProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4">
        <h3 className="text-2xl font-bold">{ label }</h3>
        <button type="button" className="flex" onClick={async() => {
          await navigator.clipboard.writeText(content);
          toast(`${label} copied to clipboard!`, { type: "success" });
        }}>
          <BoxIcon name="bxs-copy" className="bx-sm text-gray-300 hover:text-gray-500 self-center" />
        </button>
      </div>
      <pre className="bg-gray-200 border-2 border-gray-250 rounded-md p-3">{ content }</pre>
    </div>
  )
});