"use client";

import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import {
  getClubJurisdiction,
  getFeatureJurisdiction,
  JURISDICTIONS,
} from "./jurisdictions";

const GEO_URL =
  "/departamentos.geojson";

const COLOR_DEFAULT = "#374151";
const COLOR_HAS_CLUBS = "#4b5563";
const COLOR_ACTIVE = "#22c55e";
const COLOR_HOVER = "#16a34a";
const COLOR_PRESSED = "#15803d";
const COLOR_STROKE = "#111827";

function getSocials(club) {
  if (!club?.redesSociales) return [];

  if (Array.isArray(club.redesSociales)) return club.redesSociales;

  if (typeof club.redesSociales === "object") {
    return Object.entries(club.redesSociales)
      .filter(([, value]) => value)
      .map(([red, url]) => ({ red, url }));
  }

  return [];
}

function ClubCard({ club }) {
  const socials = getSocials(club);

  return (
    <article className="arg-map-club">
      <div className="arg-map-club-logo">
        {club.logo ? (
          <img src={club.logo} alt={`Logo de ${club.nombre}`} />
        ) : (
          <span>{club.nombre?.charAt(0) ?? "?"}</span>
        )}
      </div>

      <div className="arg-map-club-body">
        <strong>{club.nombre}</strong>
        <span>{club.ciudad || "Ciudad no informada"}</span>

        {socials.length > 0 && (
          <div className="arg-map-socials">
            {socials.map((social, index) => (
              <a
                key={`${social.red}-${index}`}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                title={social.red}
                aria-label={`${social.red} de ${club.nombre}`}
              >
                {social.red}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function ClubsPanel({ jurisdictionId, clubs }) {
  if (!jurisdictionId) {
    return (
      <aside className="arg-map-panel arg-map-panel-empty">
        <h3>Clubes de Buhurt Argentina</h3>
        <p>
          Pasá el mouse sobre una zona del mapa para ver sus clubes.
          También podés hacer click para mantener la selección.
        </p>
      </aside>
    );
  }

  const jurisdiction = JURISDICTIONS[jurisdictionId];

  if (!jurisdiction) {
    return null;
  }

  return (
    <aside className="arg-map-panel">
      <div className="arg-map-panel-header">
        <div>
          <span className="arg-map-eyebrow">Jurisdicción</span>
          <h3>{jurisdiction.label}</h3>
        </div>
        <span className="arg-map-count">{clubs.length}</span>
      </div>

      {clubs.length === 0 ? (
        <p className="arg-map-no-clubs">
          Todavía no hay clubes registrados en esta zona.
        </p>
      ) : (
        <div className="arg-map-clubs">
          {clubs.map((club) => (
            <ClubCard
              key={club.id ?? `${club.nombre}-${club.ciudad}`}
              club={club}
            />
          ))}
        </div>
      )}
    </aside>
  );
}

export default function ArgentinaMap({ clubs = [] }) {
  const [hoveredJurisdiction, setHoveredJurisdiction] = useState(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);

  const clubsByJurisdiction = useMemo(() => {
    const grouped = {};

    for (const club of clubs) {
      const id = getClubJurisdiction(club);
      if (!id) continue;

      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(club);
    }

    return grouped;
  }, [clubs]);

  const activeJurisdiction =
    hoveredJurisdiction ?? selectedJurisdiction;

  const activeClubs = activeJurisdiction
    ? clubsByJurisdiction[activeJurisdiction] ?? []
    : [];

  return (
    <section className="arg-map">
      <div className="arg-map-layout">
        <div className="arg-map-visual">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              center: [-64, -38],
              scale: 780,
            }}
            width={800}
            height={900}
            aria-label="Mapa de Argentina con clubes de Buhurt"
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const jurisdictionId = getFeatureJurisdiction(geo);

                  const isActive =
                    activeJurisdiction === jurisdictionId;

                  const hasClubs =
                    (clubsByJurisdiction[jurisdictionId]?.length ?? 0) > 0;

                  let fill = COLOR_DEFAULT;
                  if (isActive) fill = COLOR_ACTIVE;
                  else if (hasClubs) fill = COLOR_HAS_CLUBS;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      className={`arg-map-geography ${isActive ? "is-active" : ""
                        } ${hasClubs ? "has-clubs" : ""}`}
                      fill={fill}
                      stroke={COLOR_STROKE}
                      strokeWidth={isActive ? 1.8 : 0.65}
                      onMouseEnter={() =>
                        setHoveredJurisdiction(jurisdictionId)
                      }
                      onMouseLeave={() => setHoveredJurisdiction(null)}
                      onClick={() => {
                        setSelectedJurisdiction(jurisdictionId);
                      }}
                      tabIndex={-1}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: COLOR_HOVER,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: COLOR_PRESSED,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        <ClubsPanel
          jurisdictionId={activeJurisdiction}
          clubs={activeClubs}
        />
      </div>
    </section>
  );
}
