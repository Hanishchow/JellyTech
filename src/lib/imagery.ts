/* -----------------------------------------------------------------------------
   Placeholder imagery.

   The club has not run an activity yet, so it has no photographs of its own.
   These are Unsplash stock URLs standing in until the Media team's archive
   exists — every id below was checked to return 200 rather than written from
   memory. Replace this file wholesale once there are real photographs; nothing
   else needs to change.

   The images are decorative in every place they are used (the corridor is
   aria-hidden, the carousel labels its cards from their titles), so none of
   them carries descriptive alt text — inventing a description of a stock photo
   nobody has looked at would be worse than leaving it empty.
   -------------------------------------------------------------------------- */

const UNSPLASH = (id: string, w: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

const IDS = [
  "1532187863486-abf9dbad1b69",
  "1576086213369-97a306d36557",
  "1554475901-4538ddfbccc2",
  "1516110833967-0b5716ca1387",
  "1579154204601-01588f351e67",
  "1518152006812-edab29b069ac",
  "1611273426858-450d8e3c9fce",
  "1582719478250-c89cae4dc85b",
  "1530026186672-2cd00ffc50fe",
  "1628595351029-c2bf17511435",
  "1584515933487-779824d29309",
  "1567427017947-545c5f8d16ad",
  "1603126857599-f6e157fa2fe6",
  "1559757148-5c350d0d3c56",
  "1564325724739-bae0bd08762c",
];

/** Small, for the perspective corridor where cards are never full-bleed. */
export const STREAM_IMAGES = IDS.map((id) => ({ src: UNSPLASH(id, 600) }));

/** Larger, since the carousel also blows one up as its whole background. */
export const plate = (i: number) => UNSPLASH(IDS[i % IDS.length]!, 1400);
