import React from "react";

const TEAM = [
  ["Angeline Yu",   "Data & Product Strategy",        "Helping data organization and product planning, transforming World Cup match information into a clear, interactive, and user-centered experience.", "https://github.com/Angeline-777",        "AngelineSunshine", "f7d6c5", "female"],
  ["Bruce Yu",      "Strategy & Solution Design",      "Bridging user needs and technical execution by helping shape feature logic, data structure, and system design decisions for a smooth and practical World Cup planning experience.", "https://github.com/Hongqiuzi",           "BruceYu2025",      "c0d9ee", "male"],
  ["Richard Zhang", "Analytics & Growth",              "Passionate about analytics leveraging data-driven insights to scale high-impact brand growth.",                                                     "https://github.com/richardzhang1028-glitch", "RichardZhang2025", "d8e7c7", "male"],
  ["Richelle Liu",  "Product & User Experience",       "Not a big fan of FIFA but big fan of AI, data, product and Day yi.",                                                                               "https://github.com/ririchelle",          "RichelleWC26",     "f3c5d8", "female"],
  ["Rosemary Li",   "Full-Stack & Data Engineering Lead", "Designing the database, building the Flask API, and crafting the React interface that connects PostgreSQL data to every World Cup visitor. Also shipped the share-to-Instagram poster, persisted shareable itinerary links, calendar export, and the Vercel + Render cloud deployment.", "https://github.com/Rosemary-Li", "RosemaryLi2025", "e8d7b5", "female"],
  ["Shenghan Gao",  "Backend & Data Engineering",      "Turning messy, real-world data into clean, structured datasets — making it ready for seamless ETL and reliable database integration.",               "https://github.com/Shenghan-Gao",        "SakuraChan2026",   "c7d8d6", "female"],
];

export default function About() {
  return (
    <section id="about">
      <div className="about-header">
        <div className="about-title">Meet Our Team</div>
        <a className="about-team-link" href="https://github.com/Rosemary-Li/LA-WorldCup" target="_blank" rel="noreferrer">Project GitHub</a>
      </div>
      <div className="team-grid">
        {TEAM.map(([name, role, bio, github, seed, bg, gender]) => (
          <div className="team-card" key={name}>
            <img className="team-photo" src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${seed}&backgroundColor=${bg}&gender[]=${gender}&skin[]=f2d3b1`} alt={`${name} cartoon avatar`} />
            <div className="team-info">
              <div className="team-name">{name}</div>
              <div className="team-role">{role}</div>
              <div className="team-bio">{bio}</div>
              <a className="team-github" href={github} target="_blank" rel="noreferrer">GitHub</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
