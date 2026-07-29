import { type FC } from "react";
import { type Content } from "@prismicio/client";
import {
  PrismicImage,
  PrismicRichText,
  type SliceComponentProps,
} from "@prismicio/react";

/**
 * Props for `Image`.
 */
type ImageProps = SliceComponentProps<Content.ImageSlice>;

/**
 * Component for "Image" Slices.
 */
const Image: FC<ImageProps> = ({ slice }) => {
  return (
    <section className="image-slice reveal">
      <div className="image-container">
        {slice.primary.image && (
          <PrismicImage field={slice.primary.image} className="slice-image" />
        )}
        {slice.primary.caption && (
          <div className="image-caption">
            <PrismicRichText field={slice.primary.caption} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Image;