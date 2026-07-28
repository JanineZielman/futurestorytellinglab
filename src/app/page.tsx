import { type Metadata } from "next";

import { asDate, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceZone } from "@prismicio/react";

import { createClient, getPrismicLang } from "@/prismicio";
import ResidentsCarousel from "@/components/ResidentsCarousel";
import { components } from "@/slices";
import { PrismicNextLink } from "@prismicio/next";

type SearchParams = { lang?: string };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const lang = getPrismicLang(params.lang);
  const client = createClient();
  const home = await client
    .getByUID("page", "home", lang ? { lang } : undefined)
    .catch(async () => client.getByUID("page", "home"));

  let agenda = await client.getAllByType("now", {
    ...(lang ? { lang } : {}),
    orderings: [{ field: "my.now.date", direction: "desc" }],
  });

  if (lang && agenda.length === 0) {
    agenda = await client.getAllByType("now", {
      orderings: [{ field: "my.now.date", direction: "desc" }],
    });
  }

  let persons = await client.getAllByType("resident", {
    ...(lang ? { lang } : {}),
    orderings: [{ field: "my.resident.name", direction: "asc" }],
  });

  if (lang && persons.length === 0) {
    persons = await client.getAllByType("resident", {
      orderings: [{ field: "my.resident.name", direction: "asc" }],
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const personItems = persons.map((person) => ({
    id: person.id,
    uid: person.uid,
    name: person.data.name?.trim() ? person.data.name : "Unnamed person",
    category: (person.data as { category?: string | null }).category,
    text: person.data.text,
    imageUrl: person.data.image.url,
    imageAlt: person.data.image.alt,
  }));

  return (
    <div className="home">
      <section className="hero">
        <div>
          {home.data.image.url && <img src={home.data.image.url} alt={home.data.image.alt || ""} />}
          <h1>{home.data.title}</h1>
        </div>
        <PrismicRichText field={home.data.text} />
      </section>
      <SliceZone slices={home.data.slices} components={components} />
      <section id="upcoming" className="shows reveal">
        <div className="section-head">
          <h2>Agenda</h2>
        </div>
        <div className="shows-table">
          {agenda.map((item) => {
            const data = item.data as {
              title?: string | null;
              date?: string | null;
              time?: string | null;
              location?: string | null;
              image?: {
                url?: string | null;
                alt?: string | null;
              };
            };

            const eventDate = data.date ? asDate(data.date) : null;
            const isUpcoming = eventDate ? eventDate >= today : false;
            const dateLabel = eventDate
              ? new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(eventDate)
              : "TBA";
            const timeLabel = data.time?.trim() ? data.time : "Time TBA";
            const locationLabel = data.location?.trim() ? data.location : "Location TBA";

            return (
              <PrismicNextLink href={`/agenda/${item.uid}`} key={item.id} className="show-row-link" aria-label={`View details for ${data.title?.trim() ? data.title : "Untitled event"}`}>
                <div key={item.id} className="show-row reveal">
                  <span className="label">{dateLabel}</span>
                  <span>{data.title?.trim() ? data.title : "Untitled event"}</span>
                  <span className="show-time">{timeLabel}</span>
                  <span className="show-location">{locationLabel}</span>
                  <span className={`status${isUpcoming ? " live" : ""}`}>
                    {isUpcoming ? "Upcoming" : "Archive"}
                  </span>
                  {isFilled.image(data.image as never) && (
                    <div className="show-image-popover" aria-hidden="true">
                      <img
                        src={data.image?.url ?? ""}
                        alt={data.image?.alt ?? data.title ?? "Event image"}
                        className="show-image"
                      />
                    </div>
                  )}
                </div>
              </PrismicNextLink>
            );
          })}

          {agenda.length === 0 && (
            <div className="show-row reveal">
              <span className="label">Soon</span>
              <span>No upcoming items yet</span>
              <span>Publish a `now` document in Prismic</span>
              <span className="status">Draft</span>
            </div>
          )}
        </div>
      </section>
      <section id="residents" className="residents reveal">
        <ResidentsCarousel title="Onderzoek" items={personItems} />
      </section>
      <section id="programme" className="installations reveal">
        <div className="section-head">
          <h2>Programme</h2>
        </div>
        <div className="installation-list">
          Work in progress - more soon.
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const lang = getPrismicLang(params.lang);
  const client = createClient();
  const home = await client
    .getByUID("page", "home", lang ? { lang } : undefined)
    .catch(async () => client.getByUID("page", "home"));

  return {
    title: home.data.title,
    description: home.data.meta_description,
    openGraph: {
      title: home.data.meta_title ?? undefined,
      images: [{ url: home.data.meta_image.url ?? "" }],
    },
  };
}
