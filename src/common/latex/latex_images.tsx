import { CSSProperties, useEffect, useState } from "react";
import { LatexArgument, LatexBaseNode, LatexNodeProps } from "./latex_types";
import {
  latexBrokenInline,
  latexParseKwargs,
  latexPositionalString,
  latexGuardString,
} from "./latex_utils";

export type LatexMacroImage = LatexBaseNode<{
  type: "macro";
  content: "includegraphics";
  args?: LatexArgument[];
}>;

export function LatexImageX({ node, source }: LatexNodeProps<LatexMacroImage>) {
  const kwargs = latexParseKwargs(node, 0);

  // Don't use the second arg yet
  const src = latexPositionalString(node.args, 1);
  if (src == null) {
    return latexBrokenInline(node, source);
  }

  let scale: number | null = null;
  const texScale = kwargs.scale && kwargs.scale.length > 0 ? kwargs.scale[0] : null;

  if (texScale && latexGuardString(texScale)) {
    const parsedScale = +texScale.content;
    scale = isNaN(parsedScale) ? null : parsedScale;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing error before eslint inclusion
  const [width, setWidth] = useState<number | undefined>(undefined);
  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing error before eslint inclusion
  const [ratio, setRatio] = useState<number | undefined>(undefined);

  // eslint-disable-next-line react-hooks/rules-of-hooks -- pre-existing error before eslint inclusion
  useEffect(() => {
    getImageDimensions(src).then((dimensions) => {
      const aspectRatio = dimensions.width / dimensions.height;
      setRatio(aspectRatio);
      setWidth(dimensions.width);
    });
  }, [src]);

  const scaledWidth = width != null ? (scale != null ? width * scale : width) : undefined;

  const style: CSSProperties = {
    width: scaledWidth,
    aspectRatio: ratio,
  };

  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- pre-existing error before eslint inclusion
  return <img style={style} className="max-w-full inline-block" src={src} />;
}

async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
  });
}
