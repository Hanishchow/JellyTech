"use client";

import { useEffect, useState } from "react";
import SphereImageGrid, { type ImageData } from "@/components/ui/image-sphere";
import { listTeam, type PublishedTeamMember } from "@/lib/content";
import { Note } from "@/components/layout/editorial";

/**
 * The team, as a sphere of faces.
 *
 * Everything comes from the `team_members` table, so the page fills up as the
 * admin panel is used and needs no code change to do it. Only published rows
 * with a photograph appear: a sphere of grey circles where the faces should be
 * would look broken rather than empty, so anyone without a photo is listed
 * underneath instead of floating as a blank.
 */
export function TeamSphere() {
  const [members, setMembers] = useState<PublishedTeamMember[] | null>(null);
  const [size, setSize] = useState(560);

  useEffect(() => {
    let cancelled = false;
    listTeam().then((rows) => !cancelled && setMembers(rows));
    return () => {
      cancelled = true;
    };
  }, []);

  // The sphere is sized in pixels, not percentages, so it has to be told when
  // the window changes rather than reflowing on its own.
  useEffect(() => {
    const measure = () =>
      setSize(Math.min(620, Math.max(300, Math.floor(window.innerWidth * 0.82))));
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (members === null) return null;

  const withPhotos = members.filter((m) => m.photo_url);
  const withoutPhotos = members.filter((m) => !m.photo_url);

  if (members.length === 0) {
    return (
      <Note>
        The founding team is being constituted. Names, photographs and roles
        appear here as appointments are confirmed.
      </Note>
    );
  }

  /* A fixed radius makes eight people look lost on a sphere built for forty.
     The radius grows with the roll instead, so a small team reads as a tight
     cluster and a large one still has room. Image scale moves the other way:
     fewer faces, bigger faces. */
  const count = withPhotos.length;
  const radiusRatio = Math.min(0.36, 0.17 + count * 0.013);
  const imageScale = Math.max(0.15, 0.30 - count * 0.006);

  const images: ImageData[] = withPhotos.map((m) => ({
    id: m.id,
    src: m.photo_url as string,
    alt: `${m.name}, ${m.role}`,
    title: m.name,
    description: `${m.role} · ${m.team}${m.year ? ` · ${m.year}` : ""}`,
  }));

  return (
    <div className="space-y-12">
      {images.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="flex justify-center">
            <SphereImageGrid
              images={images}
              containerSize={size}
              sphereRadius={size * radiusRatio}
              baseImageScale={imageScale}
              dragSensitivity={0.8}
              momentumDecay={0.96}
              maxRotationSpeed={6}
              hoverScale={1.3}
              autoRotate
              autoRotateSpeed={0.18}
              renderDetail={(image) => (
                <>
                  <h3 className="font-display text-2xl">{image.title}</h3>
                  <p className="label mt-2">{image.description}</p>
                </>
              )}
            />
          </div>
          <p className="label mt-4">Drag to turn · tap a face for the name</p>
        </div>
      )}

      {withoutPhotos.length > 0 && (
        <div className="border-t border-rule pt-8">
          {images.length > 0 && <p className="label mb-5">Also on the team</p>}
          <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {withoutPhotos.map((m) => (
              <li key={m.id}>
                <p className="font-display text-xl">{m.name}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {m.role} · {m.team}
                  {m.year ? ` · ${m.year}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
