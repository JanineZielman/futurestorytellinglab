import { type FC } from "react";
import { type Content } from "@prismicio/client";
import {
  PrismicRichText,
  type SliceComponentProps,
} from "@prismicio/react";

/**
 * Props for `RichText`.
 */
type RichTextProps = SliceComponentProps<Content.RichTextSlice>;

/**
 * Component for "RichText" Slices.
 */
const RichText: FC<RichTextProps> = ({ slice }) => {
  return (
    <section id="about" className="about reveal">
      <div className="section-head">
        <h2>{slice.primary.title}</h2>
      </div>
      <div className="about-copy reveal">
        <PrismicRichText field={slice.primary.content} />
      </div>
    </section>
  );
};

export default RichText;
