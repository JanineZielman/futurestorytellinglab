import { type FC } from "react";
import { type Content } from "@prismicio/client";
import {
  type SliceComponentProps,
} from "@prismicio/react";

/**
 * Props for `Embed`.
 */
type EmbedProps = SliceComponentProps<Content.EmbedSlice>;

/**
 * Component for "Embed" Slices.
 */
const Embed: FC<EmbedProps> = ({ slice }) => {
  const embedUrl = slice.primary.embed.url as string | undefined;

  return (
    <section className="embed reveal">
      <div className="embed-container">
        {embedUrl && (
          <iframe
            src={embedUrl}
            title="Embedded content"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
};

export default Embed;
