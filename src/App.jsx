import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";

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

const EVENTS_DATA = [
  { id: 1, date: "Jun 20, 2024", title: "The Launch", venue: "Lehman College", hood: "Bedford Park", theme: "Building the ecosystem", highlights: ["Panel moderated by Majora Carter", "Cohort 1 Fellows introduced", "Lehman College partnership announced"], spotlights: ["Stephany Garcia, JobsFirstNYC", "Lawrence Fauntleroy, Lehman College", "John Campos, Career Connected Learning"], color: C.teal, photos: ["https://lh3.googleusercontent.com/pw/AP1GczM_80Z0vye6vdQnIBhDZqtTyhwCxOHqFII7JEr4J22LSLGV42jj4wfYW_bVPZKhiAwA1mv_0p6AYSUS-Y3_RMEj60puB-0gZ10gagL4-TIIilWlL-u10uoXbOD3BspN87Hx9ofKV4c4c7RHmG7P3k39xKV0wzJdt6kofULLbLA2ustopT72r5OuBMHn4fPWd7JZoug1-Jyt9v3tlvrT9GzIfGZ4BXF_1EGASeIZ7cJgBdjwH_5ikYjQMCotOCfJmKakcx69As83dv1Pt5N9dhXe4mXFjj4pDJkrdeo2EcdK5Fq9dExPKCKX8e3X6sl69IuVtWuaaH27uuLPbHQ5wpIK5QZ7BtDY981WdW20p7c5lF2bFPfgbMwQgvolAvncf2Yg_FRuUY3omUE5M9_-LB1c3_d49g-qlTH9r5_MYLSoBjAxRYEWYP4tQpXj50XKhUdv39PUERJ65YvipCSjo-WMn8nxytesGBvu3e33qv3eICWg1W5gzb8ifduvk9VRY4mKog8BoDjEt9a1JboBgx9xyzhLVFT8KW3DxzbMMK0UdjpBX1v14nM40V2JpOasLFhewrWQ1it1NX0JIWp_v5O2P4pGy8vRtPo3x5MKixGjVTW0iLeoA9XpMBdUvX1ixpx3XqiQMB0D6W95RvwpZWzltLzVLjiGHNJoTBvydwR9umZ33_gdxh3WClZsl61NeTxsh1ESXwJI0GVzkLH3WZUE87woawDEhIEXRX5EO3YN_7WF3aF0f-ChbCsotwSuXAGA93r9KevK7ZmE8h0WzlpWuhPbNeFr7InOP3KuBxBINMWxE8a-aT6vBn7XvMm6b18m_wapEXK-sNkzj6Xejph6ETArwpwxD2psM4xFyx5E9JXc1kUiF8CaLOY4vIK1fohB85woPjXipC7Kot-y57rC8Hmht7U-KzWFBLrkVRUtb5s2Bu__LG2qGq2GJTuvyr70c7OJZpKgk_1PRhpQ8oH0rvseqA4GUhlHV2YqzMO5h0k=w400", "https://lh3.googleusercontent.com/pw/AP1GczMpPYw7fBDmbb-dbdBvrIRhAKkgAqCBK_TlcQxvjTTG47zCGbs6OG9j7c-UtKfAYJ6XEGBxHAhFF1JzbKLB3FBvfgPN6nXFMQEUokoLVisHWD9P-jLllSVpJsQ2eUhhxNjouD8TxPw_RqGm5OzSadCUqWZBbu06SaOd65NiGhIS-wQ6SaTVKblBs-DZE64TGN4c5NuuYo-q2YNwQBttmC0z9l4QJ0JdHihaDN1A_mI6QcFBtXf49kEfSI_RgdLCuTbJc56Jd5Ewn2qnn2LwqqdfwAP8oRnkh5Q_ZrzsrOcvY0PBpYfFkhHXZ8AcwgXdA0VObCRdxY2hJYF--TZIkXAVuaTvL0uR4nrd07v25WAs9A5I_aV4CyAlB6aKoRpV_Uwzo0YC3LAz_jfpxqAiWDxlK6Q7KycLWbeftrqdwDL53nt7Q8Q-_I8C8SKUCv-KN87JPEGNiVSMb-TtZbCT701Zgfob9BCwhsfmQZotRnUNiLb_XA-GPFRPV58bDenYVX84FeC5XpMYAHKWJGyC7ICqciVIeIAVz79KSndHn_DoWm3HJ4n_SAT2lpvctiYEwWPl8jK6rniFc28zqbhn-VKPWhP0W_jSr9BI62U8TBXcYtM2N4z16pwUMr9ztgfSRuDmrhkUXr6Rohd00-4GKboZQMyDEDS_SeYdp4_KCBh3FXVppL1CNe4Gm3MImE1K2E0hdUpO2y1BQXTPkgkm_VdgTsXqTVIyMxNjrpHgei7nbto0GfbtU8Nwa24vchoc8XgVR2SZn-CRQLJGfBndRYLYBmvfPCgp8NoP_oyeJmAaXVUxKqsMBZCfShwv1XUnuCLBFmBMjB6LD0XNL3u6zOiTtbDIX1cRd3Zd1JqTGiaFNMlJrYHcDJvvouXSKEStlJv9BwDRZVVtGGGl5Pl56gyG6sFoCdpyWEtrrO55lbPUuUfTRHoJcptgavbrvSfBTwDQIjYwMs8wTnnnzm9imKr0fct9saOSBpcU8hTjI5F4pJQ=w400", "https://lh3.googleusercontent.com/pw/AP1GczMNGOE1Mf6x5m_zTWdunMA4HxN_rf0p81_t8X59SqTpx92Adrdf_dw8FBgDb2nSrR5ZIwhJdTaamRmdIkoAtkkfswLdqiuQCmFx2elYK6YD1-zru6VqheW1WbGsYcnhbYwR5c5vtP4VtYObxkA2HgTL6QL1UrEtWG7d_kHxHmi4Njw4RfUl-w2sjpjIQIjldHaJanwIXoSt5VS5V98EL0UkUoY7fBI9qP9eRHzRkGkJa4BiLg3Iqxw2w1ZQg_kWe0eR9j6MlI-55ZQVeFNXcqpRZ1Dr5bpKUC3Dbwa3Y8gBrwtw7wCB9cDMclGeo5hnKZy5J7AWVgzCWsmKIRv6JgJ0BzJ4ZEV-DAar8ToLGZpot02iNYMQLDxBFKhuMkqWuFt_B1EFbY-C395LxspArK1IcWKw_Pqf7ya8KDcDBXnMSJSH_X0CGEg4bMtXwoAgsWt8Nz8eSjz2DVv1KDTEHtntADYksk9z71lRoQ-Q3FqYY5b9QuRxIyXYlLb4xXwFqQ-VZDnGHsWIEK22b7zAl3i04hQQYxhBit8yyVA8ldN64iIdD86FKGD5XkuJMFIuwv_mfYLDSNWGxI-rnrvwYYoNLiU-e_Hkljxjpk3OyOVrpMDkvGScKzha3DehodymrRLqC8OT6g2L0A5LHDp2wm9KlCeYplq4dYTb__UH5VeLKpSvJzgwP-sJeb5OYTC1uJp_-8mwtPcZA4E2yI6SlR2bw6OPzqGhOgBOf8FtrVbFURinXOlw5Ya93oUzhaiPXpsUv6EIBLDiVzg2kPV3izbt8JUQM3QdTONbONe-RF1-wMQlS0FwIw4pIjAyLdyvym0Na_pPJJXnGBMgrMGywyp1JpN-julZ2X8wb8kq53Kr4hk4gGwW2bAqfbDNXObGObNGdsaP9Z3ZdkU8y_U61O7UISAczlHPqua_ufwhHs5k2jGWKWsY00PACHGw1uHMMpA09eJt9x_fpiolee8o7d6muj92dt7BqyNrtLWklsTbX2I=w400", "https://lh3.googleusercontent.com/pw/AP1GczM9o93vA1fFEnBFrxKjj---6yi_764SQ_ubLYdEUV2KGpm20TQmiJ42BXYyiUaOxRgOTeihR2WvC_nAKC-xzOlxPPUqRXu5Rnb02VrXysfjp8_dm3ApC--qIWkQy2V9QR3TnKVJZeJC3q4hcNAOD0IYF303LtIFHYedI3258kkknrifa0bCrdMBFxj3r6j3S2lwNR0w9adcr6Olav2wyAgmr9NjzoWwCzPOwETy9Kqu3DEk33AlgkBhxpKMpLrEaJ1LaLQ4gZa6WSuUN_qppV08JODHxDQO6hs3x6sXeHrgXrU8uxbYycXnkeLetAIXoRXy6JfIS8Desb1w2r9Xrez5haMZZHVq7iDDKRBdkreBxfBv_n115qflwW0g1I1nDK9wmkI2e31aL3duXpi8X-8SWK5mFJJVQlAerTvKOWFoGoso8C1gPBi8jhuCroBFeP2QtgQXyq0auY_B9jN_hWKHEvk0V2RnWK2U7oBsCN3Jl_AyvXL6QgbvIOdiUVepctYyqDEcKORfUCSX3Q0LjhJ7y2I8xcb__Hr8LJ5P9Smg2zps0z1dv6jdsyrSaJJKjswFcPCNmRMRn2vxA5kvTFuTg8w8lQB6vfnbGEWbLxkeIenSau98uDARf1y94ifAo38aKL1JutKAg1G7pAA27avm-9thra9L4EIqR1qqrMkUUkgPPGBSLIk2CNCO7YZ20HLQ457NOrbY0h8E5GGykeCwEcxY8osag0h2ub-PalR-55PfwVDV2XMiLm_Z2so30GZX7V6JfxTb0S6RX5XlD-U60V6DbZt4I1RznK2LZFu4Th9LyMdhYioS_dTmcSKFjUUBlIIotWV6-JYsKEGF5C8KdkQnuuj2F-z57jj3dZggJgUG9tSmle_ExmZZlLS2fKSwR67cEyTHCmNLU3rMNHYL9mf6deY949w_4OEKc0S4jiaoL4Q5RWDObq94n_DGwd4JcDqQfRwRcz5nLO0gaoyneS1AH_1yrcPLH8El3cqKl-4=w400", "https://lh3.googleusercontent.com/pw/AP1GczMyWxRUr8KkoxJtpI90KeDVb1Wb1_fMXqJnkcdt-9z2ORbvYj6Yr7Ht486h7BCMclq-mL1SapZd64CvQHLM33LAjA8X4PsFKbYjty2H1v2GBHadtwoyM7qAxt8YT6VnvEpOCFXPWslyPGSK5O6xGjHC0UcUFo5xK854FvqkTtOpMj6hO5PFmhBKnPd8-67CUOFXjK-AGM6WK5MvTDHF6a1ajJX7MYHKD-GZ9wF3utwB755JIlo8BWfsK9_3aHOrZGkfB7Ut2RLnExsiD0rwPqKHm6ReNutURGmSK-E55pA0PmqdjUjBQj8gmDjDyZ0IIUuZNY8l2e16Am2_CCqISFDJaAFkUCUxzeSlWjKqKfvJNFuh9VgJqvKGFK4Aj9IcXYiOzwH-6iZB0QrmBr57EekSDWYebbePIH2JZAs9SWU1LoJUdeEd1157Z9Ae5qjnL7EyYXBAt6b_3dld1mx0rIwUsl8JR5Xi__67RBDRA8obdYHRg9DaDMK1OwheZ-COWc0dyhBLTeMiLN9vhFSB5KjtxOosmLmWhI-NUZsAHjTy9RioMm1w_6Gdz77X-DavJSEDLkOfzd7xqcA621bTEBSj9kupFO7nOVVi-BL76paN2VESj4yC4iRs-BLMC0L4UK1SmPGwurFkuChYQLxUIOb-7Ct_q2hcFTtME2o-dcANohtALyxk7KA2rNNa1aEGyFlY1CMj7VkxcR98_A_rNninOOd_NXv1sFG6sXMmpgYLTzrJ3QnN_zVPIfYbSgwu4NDJidtOMUPL3s0ujVT5pbnF8v6GzCdMbdtNHf-K-t5d4soNxlcKZkfqwoRL5Vp8d9npkEQQzw0_M2-HUSDQ5oXhxfXyyYngG4p77YNHqnIf-SerLOJ_ay1XwkDstCXnFss0kVoUmV31JvHd7XVwJHSHu62aXxnUFj0DpiTzPCgVQfp0zIt5Pr4XtgbdB86km3FDTGifmXIl2rjuMdwS9SmMX7BFP8_iyY03u6EtqXX9MK4=w400", "https://lh3.googleusercontent.com/pw/AP1GczMM7TYJoNwuzbLHZA9xRIJciuS2zYLCz7J5NGgzAEtpZsDgP7sRnootXkCad-vfpF7rsFJ5EGj92SdqL4cxCfZiHSSvIAG98KxX5Dy7dJ3YMHHCPjvtVjHmNc9vfqBAIocYYx4YcQirDsAA32n-wWqtYCgBN9ViM1qmsDxcbiKapSXgfgwWA5aIEZXSCo0TwKw3CO1ZNwDH2AzURwwitwmznTmA2TrHC8W80OC_vHS43mewUcUO7Y2dGSPPyODpN1_FibpMxjaayH-aoa4QxFLbkgzuJo4gJ7cJNTLU1X61Z47fFMdwVFkJ8EbCTyv1f-cB8IL_GgOqDlkZF96FXSnQ0yOg0XlXKUejJLaAGmJqZf4qDQ_3a2gabnlO53U4uSaxLQou0Ax-7opxsfpynFqJCMfFF5ldEjiZ-V00UbOQZrxirtsgvXPsPUu6VtQMgL9FHO-I1Na_RmVB1XwaF_HLjvp7wShRdF5r44J_9n6dx-3VDmDHxGFdB2ccBZIUJQh758NJLVUMFoyEHEjn89WBw4B2Mmy-CgpMndMf33_2_Nw44Elv4JYNlFLBG2nZ4qpJhd-i-s3gkQD8hLMmAHZ0MT6_-YE5EAt_zRjV4CpxEv82KC57hygOvIf18tqIgnUNJ0GfbIJFOlZDJFLqf-SOsG0_vB1kzrUn_NYlkSwHBPTp2poq5RTEqAMPthq-U-A7n8tslOQtV5W0XKC98OTQmfYdiYdepx0-4n2jRTFLpE3i5HoLyHo-ztrEecAyUeMeLIXpXZAykV4aV22AWip5WjEgKhZYIrGdzUUYozFLIudaA2kEi8_G7mlyPjUosLX4nxZrEFWibxXICvO7cbhBpfOWYg9hWmZDPoIbdy0DY5RwASVij9CsHvh4duV6UjrvR4tPykGA_ecSe7J4-pY1MTxvXiYjh65DAdaq8NNzdizNxXP1XPg2QIem6pVOFc61FCFL85seKmirLk_RPGDjD4XZ70bPwMqrvvBdqLGkfvE=w400"], albumUrl: "https://photos.google.com/share/AF1QipPRS-oXqZCiRhYcRYXD1uhKVK9KGUsL2Ip2Od55me4D-tRQOJzl16-WzaMYEE9cJQ?key=WVdKeVU1WmM5d0pHMkJ6VzRrWmRhUTdaWWw3LUl3" },
  { id: 2, date: "Dec 5, 2024", title: "The Next Generation", venue: "Comp Sci High", hood: "Mott Haven", theme: "Innovation meets community", highlights: ["Cohort 2 Fellows revealed", "Toured new Comp Sci High building", "M&T Bank sponsorship announced"], spotlights: ["Comp Sci High Leadership", "M&T Bank Community Team"], color: C.gold, photos: [], albumUrl: "https://photos.google.com/share/AF1QipM0BbEoEp1JLTYs9yjvlrTk08Sv_4iLgJX_SNy5JQDGSxlZ8xYBkvjv8aZaR9BXAg?key=RVVnbWNVYVUzZjMyUGs2cFlXeVIwTVh4LTNZMHl3" },
  { id: 3, date: "Apr 11, 2025", title: "Funding the Future", venue: "Inspiration Point", hood: "Hunts Point", theme: "Access to capital", highlights: ["Opening by Majora Carter", "Funding strategies panel", "Fellows' business showcases", "Cohort 3 application announced"], spotlights: ["Financial providers panel", "Inspiration Point & The Peninsula team"], color: C.accent, photos: [], albumUrl: "https://photos.google.com/share/AF1QipMex9Ycd3Xu2OL96tBjIsV1-xas_XJIjHTanpCuK2-K-_8YWyLk4Wh1LAKAwMT0tg?key=VTlCeWpNT3pnZ3hGV0o3eENUNFE0eHhKWlVIVVBn" },
  { id: 4, date: "Jul 9, 2025", title: "Health is Wealth", venue: "Andrew Freedman Home", hood: "Grand Concourse", theme: "Wellness meets entrepreneurship", highlights: ["Entrepreneur health journeys panel", "Table tennis exhibition by Yasiris Ortiz", "Wellness strategies workshop"], spotlights: ["Yasiris Ortiz, CEA Fellow & Pro Athlete", "Andrew Freedman Home Staff"], color: C.teal, photos: [], albumUrl: "https://photos.google.com/share/AF1QipNV9UomyeMVtvuTzduWpPigX5kLXuZe1CfAmrroJ493KpGb8JG95Jea-IlrTO-MCw" },
  { id: 5, date: "Sep 22, 2025", title: "Cohort 2 Celebration", venue: "Univ. of Mount Saint Vincent", hood: "Riverdale", theme: "Culmination and recognition", highlights: ["Fellow spotlight presentations", "Selection committee honored", "Cohort 3 finalists revealed", "UMSV partnership deepened"], spotlights: ["UMSV Faculty & Leadership", "CEA Selection Committee", "Intern team"], color: C.gold, photos: [], albumUrl: "https://photos.google.com/share/AF1QipP9-T3vFS3hKrFNTlZb_4Ug8_VTyiCkMbpRiYyuiNrOqGUJkjSZ9zyZckrIjDVmEA" },
  { id: 6, date: "Dec 12, 2025", title: "Introducing Cohort 3", venue: "DREAM Charter High School", hood: "South Bronx", theme: "Creativity, impact, commitment", highlights: ["Emceed by Olga Perez & Chidi Asoluka", "Panel moderated by Rasheeda Frazier", "Food by Nourish & YummyTummy4Life"], spotlights: ["Olga Perez, MVP Lifeguards", "Chidi Asoluka, NewComm", "Tomas Ramos, Oyate Group & Nourish", "Rasheeda Frazier, Leadership Coach", "DREAM, BXEDC, NYPACE leaders"], color: C.accent, photos: [], albumUrl: "https://photos.google.com/share/AF1QipNtrAgkxo0Usn833d4piDFDPSn2cfsL-Zs7BdaaPYVfqhUzbnax3LgafHXdBVG9Jg?key=QVdpbjd5c0pOMmZTWVlCem5MZE1FazN6eFFYWnhn" },
];

const VENUES = [
  { name: "Lehman College", hood: "Bedford Park", year: 1968, fact: "Part of CUNY. Home to the Lehman Center for the Performing Arts, one of the Bronx's premier cultural venues.", coords: [40.8734, -73.8940], events: [1], photos: [] },
  { name: "Comp Sci High", hood: "Mott Haven", year: 2018, fact: "A public high school focused on computer science, with a brand-new facility designed for the innovators of tomorrow.", coords: [40.8095, -73.9180], events: [2], photos: [] },
  { name: "Inspiration Point", hood: "Hunts Point", year: 2023, fact: "A cultural arts center inside The Peninsula, a mixed-use campus at the forefront of South Bronx revitalization.", coords: [40.8176, -73.8870], events: [3], photos: [] },
  { name: "Andrew Freedman Home", hood: "Grand Concourse", year: 1924, fact: "Built in 1924, now an artist hub and community center. One of the most beautiful buildings on the Grand Concourse.", coords: [40.8310, -73.9235], events: [4], photos: [] },
  { name: "Mt. Saint Vincent", hood: "Riverdale", year: 1847, fact: "Founded by the Sisters of Charity of New York. A university committed to ecumenism and the development of the whole person.", coords: [40.8984, -73.9033], events: [5], photos: [] },
  { name: "DREAM Charter HS", hood: "South Bronx", year: 2020, fact: "Designed by Sir David Adjaye inside a transformed 1900s ice factory. One of NYC's most inspiring school buildings.", coords: [40.8128, -73.9210], events: [6], photos: [] },
];

const ECOSYSTEM = [
  { name: "Majora Carter", role: "Urban Revival Strategist & Author", org: "Majora Carter Group", type: "voice" },
  { name: "Rasheeda Frazier", role: "Leadership Coach & Facilitator", org: "", type: "voice" },
  { name: "Olga Perez", role: "Founder, MVP Lifeguards", org: "CEA Cohort 1 Alum", type: "fellow" },
  { name: "Chidi Asoluka", role: "Executive Director", org: "NewComm", type: "voice" },
  { name: "Tomas Ramos", role: "Founder, Oyate Group & Nourish", org: "Civic Leader", type: "voice" },
  { name: "Anthony Ramirez II", role: "Creative Entrepreneur", org: "From The Bronx", type: "fellow" },
  { name: "Melissa Groneveldt", role: "Wellness Founder", org: "YummyTummy4Life / Monshe", type: "fellow" },
  { name: "Gregory Morgan Jr.", role: "Photographer & Studio Owner", org: "LR2 Photo Studio", type: "fellow" },
  { name: "Terese Brown", role: "Fashion Designer", org: "Terese Sydonna", type: "fellow" },
  { name: "Desmond West", role: "IT Founder", org: "pinStripe IT", type: "fellow" },
  { name: "Yasiris Ortiz", role: "Pro Table Tennis Player", org: "CEA Fellow", type: "fellow" },
  { name: "Stephany Garcia", role: "Youth Employment Leader", org: "JobsFirstNYC", type: "partner" },
];

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
  const cd = useCountdown("2026-04-10T18:00:00");
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
          }}>Next gathering: April 10, 2026</span>
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
          Bronx Brilliance is a quarterly gathering that connects entrepreneurs,
          educators, students, and community builders. Each event takes place at a
          different iconic Bronx venue, with a different theme and a room full of
          people who care about this borough.
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
  const stats = [
    { v: 225000, pre: "$", suf: "+", l: "Grant Capital Deployed" },
    { v: 15, suf: "+", l: "Entrepreneurs Supported" },
    { v: 6, l: "Iconic Bronx Venues" },
    { v: 800, suf: "+", l: "Community Connections" },
    { v: 30, suf: "+", l: "Ecosystem Partners" },
  ];
  return (
    <section ref={ref} style={{
      background: C.navy, padding: "56px clamp(24px, 5vw, 48px)",
      borderBottom: `1px solid rgba(9,175,180,0.1)`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            textAlign: "center", flex: "1 1 140px",
            opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(12px)",
            transition: `all 0.5s ease-out ${i * 0.08}s`,
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800,
              color: C.gold, lineHeight: 1.1,
            }}>{vis && <Counter end={s.v} pre={s.pre || ""} suf={s.suf || ""} />}</div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(250,247,242,0.4)",
              marginTop: 4, fontWeight: 500,
            }}>{s.l}</div>
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
        }}>Every Gathering Tells a Story</h2>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, color: "#5a6b70",
          maxWidth: 560, margin: "0 0 52px", lineHeight: 1.65,
        }}>
          Six events. Six neighborhoods. Hundreds of people showing up for each other
          and for the Bronx. Click any event to see who was in the room and what happened.
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
              }}>April 10, 2026 · Lehman College, Bedford Park</div>
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
        }}>It Takes a Community</h2>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17,
          color: "rgba(250,247,242,0.55)", maxWidth: 540, margin: "0 0 36px", lineHeight: 1.65,
        }}>
          Bronx Brilliance isn't about any one organization. It's about the entrepreneurs,
          educators, civic leaders, students, and neighbors who show up and build together.
          Here are some of the people who've shaped these gatherings.
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
        }}>Every Venue Has a Story</h2>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, color: "#5a6b70",
          maxWidth: 560, margin: "0 0 48px", lineHeight: 1.65,
        }}>
          We host each event at a different Bronx landmark. Before you arrive, our
          AI-powered guide helps you discover the venue's history, the neighborhood's
          character, and what to explore nearby.
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
              <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" />
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
          }}>Returning to where it all started</span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 5vw, 52px)",
          fontWeight: 800, color: C.warm, margin: "0 0 6px", letterSpacing: "-0.02em",
        }}>April 10, 2026</h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: C.teal, fontWeight: 600,
          margin: "0 0 6px",
        }}>Lehman College · Bedford Park, Bronx</p>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16,
          color: "rgba(250,247,242,0.45)", margin: "0 0 36px", lineHeight: 1.6,
        }}>Full details are on the way. Register through Syngine Events to save your
          spot and see who else is coming.</p>

        <a href="https://syngine.io" target="_blank" rel="noopener noreferrer" style={{
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
