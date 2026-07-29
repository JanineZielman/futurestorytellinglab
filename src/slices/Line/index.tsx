import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `Line`.
 */
export type LineProps = SliceComponentProps<Content.LineSlice>;

/**
 * Component for "Line" Slices.
 */
const Line: FC<LineProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      {slice.primary.line && (
        <div className="line">
        </div>
      )}
    </section>
  );
};

export default Line;
