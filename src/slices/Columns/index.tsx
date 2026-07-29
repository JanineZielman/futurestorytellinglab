import { type FC } from "react";
import { type Content } from "@prismicio/client";
import {
  PrismicRichText,
  type SliceComponentProps,
} from "@prismicio/react";

/**
 * Props for `Columns`.
 */
type ColumnsProps = SliceComponentProps<Content.ColumnsSlice>;

/**
 * Component for "Columns" Slices.
 */
const Columns: FC<ColumnsProps> = ({ slice }) => {
  return (
    <section className="columns reveal">
      <div className="columns-container">
        {slice.primary.column.map((item, index) => (
          <div key={index} className="column">
            <PrismicRichText field={item.content} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Columns;