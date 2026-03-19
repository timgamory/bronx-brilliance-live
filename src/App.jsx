import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import eventsData from "./data/events.json";
import venuesData from "./data/venues.json";
import peopleData from "./data/people.json";
import statsData from "./data/stats.json";
import copyData from "./data/copy.json";

// ============================================================
// BronxBrilliance.live — v2 Prototype
// Community-owned. AI-powered. Ecosystem-first.
// ============================================================

const C = {
  navy: "#0d252b",
  teal: "#09afb4",
  gold: "#e8a838",
  warm: "#faf7f2",
  cream: "#f5efe6",
  dark: "#1a1a1a",
  accent: "#d4553a",
  sage: "#5a7a6a",
};

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function useCountdown(target) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target) - new Date();
      if (diff <= 0) return;
      setT({ d: Math.floor(diff / 864e5), h: Math.floor((diff % 864e5) / 36e5), m: Math.floor((diff % 36e5) / 6e4), s: Math.floor((diff % 6e4) / 1e3) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function Counter({ end, dur = 2000, pre = "", suf = "" }) {
  const [c, setC] = useState(0);
  const [ref, vis] = useInView();
  useEffect(() => {
    if (!vis) return;
    const s = performance.now();
    const step = (n) => { const p = Math.min((n - s) / dur, 1); setC(Math.floor((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [vis, end, dur]);
  return <span ref={ref}>{pre}{c.toLocaleString()}{suf}</span>;
}

// ============================================================
// Data
// ============================================================

const EVENTS_DATA = eventsData.map(e => ({
  ...e,
  color: C[e.color] || C.teal,
}));

const VENUES = venuesData;

const ECOSYSTEM = peopleData;

// ============================================================
// Components
// ============================================================

function Nav({ active }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { id: "home", label: "Home" },
    { id: "story", label: "Our Story" },
    { id: "ecosystem", label: "People" },
    { id: "places", label: "Places" },
    { id: "next", label: "Next Event" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(13,37,43,0.95)" : "rgba(13,37,43,0.6)",
      backdropFilter: "blur(16px)", borderBottom: `1px solid rgba(9,175,180,${scrolled ? 0.15 : 0.05})`,
      padding: "0 clamp(16px, 4vw, 48px)", height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "all 0.4s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.teal}, ${C.gold})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 13, color: C.navy, fontFamily: "'Playfair Display', serif",
        }}>BB</div>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16,
          color: C.warm, letterSpacing: "-0.02em",
        }}>Bronx<span style={{ color: C.gold }}>Brilliance</span></span>
      </div>
      <div style={{ display: "flex", gap: "clamp(12px, 2.5vw, 28px)", alignItems: "center" }}>
        {links.map(l => (
          <a key={l.id} href={`#${l.id}`} style={{
            color: active === l.id ? C.gold : "rgba(250,247,242,0.55)",
            textDecoration: "none", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.05em", textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif", transition: "color 0.3s",
          }}>{l.label}</a>
        ))}
        <a href="#next" style={{
          padding: "8px 18px", borderRadius: 6,
          background: C.teal, color: C.navy, textDecoration: "none",
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.03em",
        }}>RSVP</a>
      </div>
    </nav>
  );
}

function Hero() {
  const cd = useCountdown(copyData.next_event_date);
  return (
    <section id="home" style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      background: `radial-gradient(ellipse at 20% 50%, #0f3a3e 0%, ${C.navy} 60%, #091b1f 100%)`,
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "100px clamp(24px, 5vw, 64px) 80px",
    }}>
      {/* Abstract community circles */}
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${15 + Math.sin(i * 1.3) * 35}%`,
          left: `${55 + Math.cos(i * 0.9) * 30}%`,
          width: 80 + i * 40, height: 80 + i * 40,
          borderRadius: "50%",
          border: `1px solid rgba(${i % 2 === 0 ? "9,175,180" : "232,168,56"},${0.04 + i * 0.015})`,
          animation: `pulse ${6 + i}s ease-in-out infinite ${i * 0.5}s`,
        }} />
      ))}

      <div style={{ position: "relative", maxWidth: 800, zIndex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20,
          background: "rgba(232,168,56,0.1)", border: "1px solid rgba(232,168,56,0.2)",
          marginBottom: 28, animation: "fadeIn 0.8s ease-out both",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            color: C.gold, letterSpacing: "0.04em",
          }}>{`Next gathering: ${copyData.next_event_display}`}</span>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(44px, 7.5vw, 88px)", fontWeight: 900,
          lineHeight: 1.02, color: C.warm, margin: 0, letterSpacing: "-0.03em",
          animation: "fadeSlideUp 0.8s ease-out 0.1s both",
        }}>
          Where the Bronx<br />
          <span style={{
            background: `linear-gradient(135deg, ${C.teal} 20%, ${C.gold} 80%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>comes together.</span>
        </h1>

        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: "clamp(17px, 2.2vw, 21px)", lineHeight: 1.65,
          color: "rgba(250,247,242,0.65)", maxWidth: 520,
          margin: "28px 0 0", animation: "fadeSlideUp 0.8s ease-out 0.25s both",
        }}>
          {copyData.hero_description}
        </p>

        {/* Countdown */}
        <div style={{
          marginTop: 44, animation: "fadeSlideUp 0.8s ease-out 0.4s both",
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { v: cd.d, l: "Days" }, { v: cd.h, l: "Hrs" },
              { v: cd.m, l: "Min" }, { v: cd.s, l: "Sec" },
            ].map((c, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10, padding: "14px 18px", minWidth: 72, textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 800,
                  color: C.warm, lineHeight: 1,
                }}>{String(c.v).padStart(2, "0")}</div>
                <div style={{
                  fontSize: 10, color: "rgba(250,247,242,0.35)", letterSpacing: "0.08em",
                  textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginTop: 4,
                }}>{c.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap",
          animation: "fadeSlideUp 0.8s ease-out 0.55s both",
        }}>
          <a href="#next" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "15px 30px", borderRadius: 8,
            background: `linear-gradient(135deg, ${C.teal}, #07969a)`,
            color: C.warm, textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
            boxShadow: `0 4px 20px rgba(9,175,180,0.25)`,
          }}>Register via Syngine Events →</a>
          <a href="#story" style={{
            display: "inline-flex", alignItems: "center",
            padding: "15px 28px", borderRadius: 8,
            border: "1px solid rgba(250,247,242,0.15)", color: "rgba(250,247,242,0.7)",
            textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600, fontSize: 15,
          }}>See Past Events</a>
        </div>

        {/* Steward badge */}
        <div style={{
          marginTop: 48, display: "flex", alignItems: "center", gap: 10,
          animation: "fadeSlideUp 0.8s ease-out 0.7s both",
        }}>
          <div style={{
            width: 1, height: 24, background: "rgba(250,247,242,0.12)",
          }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: "rgba(250,247,242,0.3)", letterSpacing: "0.02em",
          }}>Stewarded by the <strong style={{ color: "rgba(250,247,242,0.5)" }}>Community Enterprise Accelerator</strong></span>
        </div>
      </div>
    </section>
  );
}

function ImpactBar() {
  const [ref, vis] = useInView();
  return (
    <section ref={ref} style={{
      background: C.navy, padding: "56px clamp(24px, 5vw, 48px)",
      borderBottom: `1px solid rgba(9,175,180,0.1)`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
      }}>
        {statsData.map((s, i) => (
          <div key={i} style={{
            textAlign: "center", flex: "1 1 140px",
            opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(12px)",
            transition: `all 0.5s ease-out ${i * 0.08}s`,
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800,
              color: C.gold, lineHeight: 1.1,
            }}>{vis && <Counter end={s.value} pre={s.prefix || ""} suf={s.suffix || ""} />}</div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(250,247,242,0.4)",
              marginTop: 4, fontWeight: 500,
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EventJourney() {
  const [expanded, setExpanded] = useState(null);

  return (
    <section id="story" style={{ background: C.warm, padding: "100px clamp(24px, 5vw, 48px)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal,
        }}>The Journey So Far</span>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 44px)",
          fontWeight: 800, color: C.navy, margin: "8px 0 8px", letterSpacing: "-0.02em",
        }}>{copyData.story_heading}</h2>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, color: "#5a6b70",
          maxWidth: 560, margin: "0 0 52px", lineHeight: 1.65,
        }}>
          {copyData.story_description}
        </p>

        <div style={{ position: "relative" }}>
          {/* Timeline spine */}
          <div style={{
            position: "absolute", left: 20, top: 0, bottom: 60, width: 2,
            background: `linear-gradient(to bottom, ${C.teal}40, ${C.gold}40, ${C.accent}40)`,
          }} />

          {EVENTS_DATA.map((evt, i) => {
            const isOpen = expanded === evt.id;
            const [ref, vis] = useInView(0.05);
            return (
              <div key={evt.id} ref={ref} style={{
                position: "relative", paddingLeft: 56, marginBottom: 16,
                opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-16px)",
                transition: `all 0.5s ease-out ${i * 0.06}s`,
              }}>
                {/* Node */}
                <div style={{
                  position: "absolute", left: 10, top: 20, width: 22, height: 22,
                  borderRadius: "50%", background: evt.color,
                  border: `3px solid ${C.warm}`, boxShadow: `0 0 0 2px ${evt.color}30`,
                  cursor: "pointer", transition: "transform 0.2s",
                  transform: isOpen ? "scale(1.2)" : "scale(1)",
                }} onClick={() => setExpanded(isOpen ? null : evt.id)} />

                <div
                  onClick={() => setExpanded(isOpen ? null : evt.id)}
                  style={{
                    background: "#fff", borderRadius: 14, overflow: "hidden",
                    border: isOpen ? `1px solid ${evt.color}30` : "1px solid rgba(13,37,43,0.06)",
                    boxShadow: isOpen ? `0 8px 32px rgba(13,37,43,0.08)` : "0 1px 8px rgba(13,37,43,0.04)",
                    cursor: "pointer", transition: "all 0.3s",
                  }}
                >
                  {/* Header bar */}
                  <div style={{
                    padding: "20px 24px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexWrap: "wrap", gap: 8,
                  }}>
                    <div>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                        color: evt.color,
                      }}>{evt.date}</span>
                      <h3 style={{
                        fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700,
                        color: C.navy, margin: "4px 0 0",
                      }}>{evt.title}</h3>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8a9498",
                      }}>{evt.venue}, {evt.hood}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
                        padding: "4px 10px", borderRadius: 12, background: `${evt.color}0d`, color: evt.color,
                      }}>{evt.hood}</span>
                      <span style={{
                        fontSize: 18, color: "#8a9498", transition: "transform 0.3s",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block",
                      }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{
                      padding: "0 24px 24px",
                      borderTop: `1px solid rgba(13,37,43,0.04)`,
                      animation: "fadeIn 0.3s ease-out",
                    }}>
                      <div style={{ paddingTop: 20 }}>
                        <p style={{
                          fontFamily: "'Source Serif 4', Georgia, serif",
                          fontSize: 15, color: "#5a6b70", fontStyle: "italic", margin: "0 0 20px",
                        }}>Theme: "{evt.theme}"</p>

                        {/* Highlights */}
                        <div style={{ marginBottom: 20 }}>
                          <span style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
                            color: C.navy, letterSpacing: "0.06em", textTransform: "uppercase",
                          }}>What Happened</span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {evt.highlights.map((h, j) => (
                              <span key={j} style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                                padding: "5px 12px", borderRadius: 16, background: "rgba(13,37,43,0.04)", color: "#5a6b70",
                              }}>{h}</span>
                            ))}
                          </div>
                        </div>

                        {/* Ecosystem Spotlights */}
                        <div style={{ marginBottom: 20 }}>
                          <span style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
                            color: C.navy, letterSpacing: "0.06em", textTransform: "uppercase",
                          }}>People in the Room</span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {evt.spotlights.map((s, j) => (
                              <span key={j} style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                                padding: "5px 12px", borderRadius: 16, background: `${C.teal}0d`, color: C.teal,
                                border: `1px solid ${C.teal}18`,
                              }}>{s}</span>
                            ))}
                          </div>
                        </div>

                        {/* Photo Gallery + AI Recap */}
                        <div style={{
                          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                        }}>
                          {evt.photos.length > 0 ? (
                            <div>
                              <div style={{
                                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
                              }}>
                                {evt.photos.slice(0, 6).map((url, j) => (
                                  <img key={j} src={url} alt={`${evt.title} photo ${j + 1}`} loading="lazy" style={{
                                    width: "100%", height: 80, objectFit: "cover",
                                    borderRadius: 8, cursor: "pointer",
                                    transition: "transform 0.2s",
                                  }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                  />
                                ))}
                              </div>
                              {evt.albumUrl && (
                                <a href={evt.albumUrl} target="_blank" rel="noopener noreferrer" style={{
                                  display: "inline-block", marginTop: 8,
                                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                                  color: evt.color, textDecoration: "none",
                                }}>View full album →</a>
                              )}
                            </div>
                          ) : (
                            <div style={{
                              height: 120, borderRadius: 10,
                              background: `linear-gradient(135deg, ${evt.color}08, ${evt.color}03)`,
                              border: `1px dashed ${evt.color}25`,
                              display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center", gap: 6,
                            }}>
                              <span style={{ fontSize: 22 }}>📸</span>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: evt.color, fontWeight: 600 }}>Photo Gallery</span>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#8a9498" }}>Coming soon</span>
                            </div>
                          )}
                          <div style={{
                            height: 120, borderRadius: 10,
                            background: `linear-gradient(135deg, rgba(90,122,106,0.06), rgba(90,122,106,0.02))`,
                            border: `1px dashed rgba(90,122,106,0.2)`,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", gap: 6,
                          }}>
                            <span style={{ fontSize: 22 }}>✨</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.sage, fontWeight: 600 }}>AI Event Recap</span>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#8a9498" }}>Auto-generated summary</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Next event */}
          <div style={{ position: "relative", paddingLeft: 56, paddingTop: 8 }}>
            <div style={{
              position: "absolute", left: 10, top: 18, width: 22, height: 22,
              borderRadius: "50%", border: `2px dashed ${C.teal}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal, animation: "pulse 2s ease-in-out infinite" }} />
            </div>
            <a href="#next" style={{
              display: "block", padding: 20, borderRadius: 12,
              border: `2px dashed ${C.teal}25`, background: `${C.teal}04`,
              textDecoration: "none",
            }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                color: C.teal, letterSpacing: "0.06em", textTransform: "uppercase",
              }}>Coming Up</span>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700,
                color: C.navy, marginTop: 4,
              }}>{`${copyData.next_event_display} · ${copyData.next_event_venue}, ${copyData.next_event_hood}`}</div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  const [filter, setFilter] = useState("all");
  const types = [
    { key: "all", label: "Everyone" },
    { key: "fellow", label: "Fellows" },
    { key: "voice", label: "Voices" },
    { key: "partner", label: "Partners" },
  ];
  const filtered = filter === "all" ? ECOSYSTEM : ECOSYSTEM.filter(p => p.type === filter);

  return (
    <section id="ecosystem" style={{
      background: C.navy, padding: "100px clamp(24px, 5vw, 48px)", position: "relative",
    }}>
      {/* Subtle community pattern */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.03 }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            top: `${(i * 17) % 100}%`, left: `${(i * 23 + 10) % 100}%`,
            width: 60 + (i % 4) * 20, height: 60 + (i % 4) * 20,
            borderRadius: "50%", border: "1px solid rgba(250,247,242,0.5)",
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", color: C.gold,
        }}>The Ecosystem</span>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 44px)",
          fontWeight: 800, color: C.warm, margin: "8px 0 8px", letterSpacing: "-0.02em",
        }}>{copyData.ecosystem_heading}</h2>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17,
          color: "rgba(250,247,242,0.55)", maxWidth: 540, margin: "0 0 36px", lineHeight: 1.65,
        }}>
          {copyData.ecosystem_description}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {types.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)} style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              background: filter === t.key ? C.teal : "rgba(255,255,255,0.05)",
              color: filter === t.key ? C.navy : "rgba(250,247,242,0.45)",
              transition: "all 0.3s",
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
        }}>
          {filtered.map((p, i) => (
            <div key={`${filter}-${i}`} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "22px 20px",
              display: "flex", gap: 14, alignItems: "flex-start",
              animation: `fadeIn 0.4s ease-out ${i * 0.04}s both`,
              transition: "border-color 0.3s",
              cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${C.teal}40`}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: p.type === "fellow" ? `linear-gradient(135deg, ${C.teal}50, ${C.gold}50)` :
                  p.type === "voice" ? `linear-gradient(135deg, ${C.accent}50, ${C.gold}50)` :
                  `linear-gradient(135deg, ${C.sage}50, ${C.teal}50)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: C.warm,
                fontFamily: "'Playfair Display', serif",
              }}>{p.name.charAt(0)}</div>
              <div>
                <div style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700,
                  color: C.warm, lineHeight: 1.2,
                }}>{p.name}</div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.teal,
                  marginTop: 3, fontWeight: 500,
                }}>{p.role}</div>
                {p.org && <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                  color: "rgba(250,247,242,0.35)", marginTop: 2,
                }}>{p.org}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Community invite */}
        <div style={{
          marginTop: 40, padding: 28, borderRadius: 14, textAlign: "center",
          border: `1px dashed rgba(232,168,56,0.2)`, background: "rgba(232,168,56,0.03)",
        }}>
          <p style={{
            fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700,
            color: C.warm, margin: "0 0 6px",
          }}>This list keeps growing.</p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            color: "rgba(250,247,242,0.45)", margin: "0 0 16px",
          }}>Every event adds new faces, new voices, new energy. Come be part of it.</p>
          <a href="#next" style={{
            display: "inline-block", padding: "10px 24px", borderRadius: 8,
            background: C.gold, color: C.navy, textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
          }}>Join the Next Gathering →</a>
        </div>
      </div>
    </section>
  );
}

function VenueExplorer() {
  const [active, setActive] = useState(null);
  const venue = active !== null ? VENUES[active] : null;

  return (
    <section id="places" style={{
      background: C.cream, padding: "100px clamp(24px, 5vw, 48px)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", color: C.accent,
        }}>Across the Borough</span>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 44px)",
          fontWeight: 800, color: C.navy, margin: "8px 0 8px", letterSpacing: "-0.02em",
        }}>{copyData.venues_heading}</h2>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, color: "#5a6b70",
          maxWidth: 560, margin: "0 0 48px", lineHeight: 1.65,
        }}>
          {copyData.venues_description}
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
          minHeight: 500,
        }}>
          {/* Map */}
          <div style={{
            borderRadius: 20, overflow: "hidden",
            border: "1px solid rgba(13,37,43,0.08)",
          }}>
            <MapContainer
              center={[40.8448, -73.9125]}
              zoom={12}
              scrollWheelZoom={false}
              style={{ height: "100%", minHeight: 500 }}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {VENUES.map((v, i) => (
                <CircleMarker
                  key={i}
                  center={v.coords}
                  radius={active === i ? 12 : 7}
                  pathOptions={{
                    fillColor: active === i ? C.gold : C.teal,
                    fillOpacity: 0.9,
                    color: active === i ? C.gold : C.teal,
                    weight: active === i ? 3 : 2,
                    opacity: 0.4,
                  }}
                  eventHandlers={{
                    click: () => setActive(active === i ? null : i),
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    permanent={active === i}
                    className="venue-tooltip"
                  >
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                    }}>{v.name}</span>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          {/* Detail panel */}
          <div style={{
            borderRadius: 16, overflow: "hidden",
            background: "#fff", border: "1px solid rgba(13,37,43,0.06)",
            display: "flex", flexDirection: "column",
          }}>
            {venue ? (
              <div style={{ padding: 28, flex: 1, animation: "fadeIn 0.3s ease-out" }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
                  color: C.teal, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>est. {venue.year} · {venue.hood}</span>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800,
                  color: C.navy, margin: "8px 0 12px",
                }}>{venue.name}</h3>
                <p style={{
                  fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 15,
                  color: "#5a6b70", lineHeight: 1.6, margin: "0 0 24px",
                }}>{venue.fact}</p>

                {/* AI Feature callout */}
                <div style={{
                  background: `linear-gradient(135deg, ${C.navy}06, ${C.teal}04)`,
                  borderRadius: 12, padding: 20, border: `1px solid ${C.teal}12`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 16 }}>✨</span>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                      color: C.teal, letterSpacing: "0.04em",
                    }}>AI NEIGHBORHOOD GUIDE</span>
                  </div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#5a6b70",
                    lineHeight: 1.55, margin: "0 0 14px",
                  }}>
                    Before each event, attendees get an AI-generated guide to the
                    host neighborhood: local restaurants, history, notable residents,
                    and things to do nearby. Learn about the Bronx while you're here.
                  </p>
                  <div style={{
                    display: "flex", gap: 6, flexWrap: "wrap",
                  }}>
                    {["Local Eats", "Neighborhood History", "Getting There", "What's Nearby"].map((tag, j) => (
                      <span key={j} style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
                        padding: "4px 10px", borderRadius: 12, background: `${C.teal}10`,
                        color: C.teal,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Venue photos */}
                {venue.photos.length > 0 ? (
                  <div style={{
                    marginTop: 16, display: "grid",
                    gridTemplateColumns: venue.photos.length === 1 ? "1fr" : "1fr 1fr",
                    gap: 8,
                  }}>
                    {venue.photos.slice(0, 2).map((url, j) => (
                      <img key={j} src={url} alt={`${venue.name} photo ${j + 1}`} loading="lazy" style={{
                        width: "100%", height: 100, objectFit: "cover",
                        borderRadius: 10, cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    marginTop: 16, height: 100, borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.accent}06, ${C.gold}04)`,
                    border: `1px dashed ${C.accent}20`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 16 }}>📸</span>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.accent,
                      fontWeight: 600,
                    }}>Venue Photos</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 40,
              }}>
                <span style={{ fontSize: 32, marginBottom: 12 }}>🗺️</span>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#8a9498",
                  textAlign: "center", fontWeight: 500,
                }}>Click a pin to explore a venue</p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#b0b8bc",
                  textAlign: "center", marginTop: 4,
                }}>Each event is hosted at a different Bronx landmark</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AIFeatures() {
  const features = [
    {
      icon: "🗺️", title: "Neighborhood Guide",
      desc: "Before each event, attendees receive an AI-generated guide covering the host neighborhood's history, local restaurants, transit options, and hidden gems. Arrive early and explore.",
      tag: "Pre-Event",
    },
    {
      icon: "📝", title: "Auto Event Recaps",
      desc: "After each event, AI generates a summary from photos, social posts, and notes. Key quotes, highlights, and connections made, published to the site within 48 hours.",
      tag: "Post-Event",
    },
    {
      icon: "📸", title: "Smart Photo Gallery",
      desc: "Event photos from Google Photos are organized by AI: group shots, panel moments, networking, food. Attendees can find photos of themselves and share with a branded overlay.",
      tag: "During & After",
    },
    {
      icon: "🤝", title: "Connection Suggestions",
      desc: "Powered by Syngine Events. When you register, the system surfaces people you might want to meet based on shared interests and goals. You'll see who's in the room before you arrive.",
      tag: "Via Syngine",
    },
    {
      icon: "🎬", title: "Video Highlight Reels",
      desc: "AI-assisted editing turns raw event footage into short, captioned video clips. Panel highlights, attendee reactions, and atmosphere shots, ready for social sharing.",
      tag: "Post-Event",
    },
    {
      icon: "📊", title: "Impact Storytelling",
      desc: "AI tracks the growing ecosystem across events: new connections formed, businesses launched, partnerships started. The site tells the story of cumulative community impact.",
      tag: "Ongoing",
    },
  ];

  return (
    <section style={{
      background: C.warm, padding: "100px clamp(24px, 5vw, 48px)",
      borderTop: `1px solid rgba(13,37,43,0.06)`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase", color: C.sage,
          }}>Built to Scale with a Small Team</span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 44px)",
            fontWeight: 800, color: C.navy, margin: "8px 0 8px", letterSpacing: "-0.02em",
          }}>AI That Works for the Community</h2>
          <p style={{
            fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, color: "#5a6b70",
            maxWidth: 540, margin: "0 auto", lineHeight: 1.65,
          }}>
            We use AI to handle the heavy lifting so our small team can focus on
            what matters most: bringing people together.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16,
        }}>
          {features.map((f, i) => {
            const [ref, vis] = useInView(0.1);
            return (
              <div key={i} ref={ref} style={{
                background: "#fff", borderRadius: 14, padding: 28,
                border: "1px solid rgba(13,37,43,0.06)",
                opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)",
                transition: `all 0.5s ease-out ${i * 0.06}s`,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  marginBottom: 14,
                }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
                    padding: "3px 8px", borderRadius: 8,
                    background: `${C.sage}10`, color: C.sage,
                    letterSpacing: "0.04em", textTransform: "uppercase",
                  }}>{f.tag}</span>
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
                  color: C.navy, margin: "0 0 8px",
                }}>{f.title}</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#5a6b70",
                  lineHeight: 1.55, margin: 0,
                }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NextEventSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section id="next" style={{
      background: `radial-gradient(ellipse at 50% 80%, #0f3a3e, ${C.navy} 70%)`,
      padding: "100px clamp(24px, 5vw, 48px)", position: "relative", overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.teal}08, transparent 70%)`,
      }} />

      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 20,
          background: "rgba(232,168,56,0.12)", border: "1px solid rgba(232,168,56,0.2)",
          marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            color: C.gold, letterSpacing: "0.04em",
          }}>{copyData.next_event_tagline}</span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 5vw, 52px)",
          fontWeight: 800, color: C.warm, margin: "0 0 6px", letterSpacing: "-0.02em",
        }}>{copyData.next_event_display}</h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: C.teal, fontWeight: 600,
          margin: "0 0 6px",
        }}>{`${copyData.next_event_venue} · ${copyData.next_event_hood}, Bronx`}</p>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16,
          color: "rgba(250,247,242,0.45)", margin: "0 0 36px", lineHeight: 1.6,
        }}>Full details are on the way. Register through Syngine Events to save your
          spot and see who else is coming.</p>

        <a href={copyData.syngine_url} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "16px 36px", borderRadius: 10,
          background: `linear-gradient(135deg, ${C.teal}, #07969a)`,
          color: C.warm, textDecoration: "none",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16,
          boxShadow: `0 6px 28px rgba(9,175,180,0.3)`,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}>
          Register on Syngine Events →
        </a>

        {/* Or stay in the loop */}
        <div style={{
          marginTop: 32, padding: "24px 28px", borderRadius: 14,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(250,247,242,0.5)",
            margin: "0 0 14px",
          }}>Not ready to register? Get notified when details drop.</p>
          {!done ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: "1 1 220px", maxWidth: 280, padding: "12px 16px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
                  color: C.warm, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none",
                }}
              />
              <button onClick={() => email && setDone(true)} style={{
                padding: "12px 24px", borderRadius: 8, border: "none",
                background: C.gold, color: C.navy,
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>Notify Me</button>
            </div>
          ) : (
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: C.teal,
              fontWeight: 600, margin: 0,
            }}>You're on the list! We'll be in touch. 🎉</p>
          )}
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex" }}>
            {[C.teal, C.gold, C.accent, "#7b5ea7", "#4a9b8f", "#c77a3c"].map((c, i) => (
              <div key={i} style={{
                width: 26, height: 26, borderRadius: "50%",
                background: `linear-gradient(135deg, ${c}, ${c}bb)`,
                border: `2px solid ${C.navy}`, marginLeft: i > 0 ? -7 : 0,
                fontSize: 10, fontWeight: 700, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif",
              }}>{String.fromCharCode(65 + i)}</div>
            ))}
          </div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: "rgba(250,247,242,0.35)",
          }}>See who's registered on Syngine</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      background: C.navy, padding: "56px clamp(24px, 5vw, 48px) 36px",
      borderTop: `1px solid rgba(9,175,180,0.08)`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 36,
      }}>
        <div style={{ maxWidth: 300 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800,
            color: C.warm, marginBottom: 10,
          }}>Bronx<span style={{ color: C.gold }}>Brilliance</span><span style={{ color: C.teal, fontSize: 12 }}>.live</span></div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            color: "rgba(250,247,242,0.35)", lineHeight: 1.6,
          }}>
            A quarterly gathering for the Bronx entrepreneurial ecosystem.
            Stewarded by the Community Enterprise Accelerator.
          </p>
          <div style={{
            marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap",
          }}>
            {["Level Up Ventures", "Elevate Digital", "M&T Bank"].map(p => (
              <span key={p} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                color: "rgba(250,247,242,0.2)", padding: "3px 8px",
                border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4,
              }}>{p}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          {[
            { title: "Explore", items: ["Past Events", "People", "Venues", "Impact"] },
            { title: "Get Involved", items: ["Attend an Event", "Become a Fellow", "Partner With Us", "Volunteer"] },
            { title: "Connect", items: ["Instagram", "LinkedIn", "Email", "Syngine Events"] },
          ].map(col => (
            <div key={col.title}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
                color: C.teal, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px",
              }}>{col.title}</p>
              {col.items.map(item => (
                <a key={item} href="#" style={{
                  display: "block", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, color: "rgba(250,247,242,0.4)", textDecoration: "none",
                  marginBottom: 7, transition: "color 0.2s",
                }}
                  onMouseEnter={e => e.target.style.color = C.warm}
                  onMouseLeave={e => e.target.style.color = "rgba(250,247,242,0.4)"}
                >{item}</a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{
        maxWidth: 1100, margin: "36px auto 0",
        borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16,
        textAlign: "center",
      }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 11,
          color: "rgba(250,247,242,0.2)",
        }}>© 2026 BronxBrilliance.live · A community gathering, stewarded by CEA</span>
      </div>
    </footer>
  );
}

// ============================================================
// App
// ============================================================

export default function BronxBrillianceLive() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const ids = ["home", "story", "ecosystem", "places", "next"];
    const h = () => {
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 180) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ background: C.warm, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        ::selection { background: ${C.teal}40; }
        input::placeholder { color: rgba(250,247,242,0.3); }
      `}</style>
      <Nav active={active} />
      <Hero />
      <ImpactBar />
      <EventJourney />
      <EcosystemSection />
      <VenueExplorer />
      <AIFeatures />
      <NextEventSection />
      <Footer />
    </div>
  );
}
