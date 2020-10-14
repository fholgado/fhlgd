import React, { useEffect, useState } from "react";
import "./App.css";

function ProjectCard({ data }) {
  console.log(data["Finished Photos"]);
  return (
    <div className="project-card">
      <div className="project-image">
        {data["Finished Photos"] ? (
          <img
            alt="project"
            src={data["Finished Photos"][0].thumbnails.large.url}
          />
        ) : data["Progress Photos"] > 0 ? (
          <img
            alt="Project"
            src={data["Progress Photos"][0].thumbnails.large.url}
          />
        ) : null}
      </div>
      <div className="project-meta">
        <h3>
          {data.Name} ({data["Date started"]})
        </h3>
        <p>{data.Description}</p>
      </div>
    </div>
  );
}

function App() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetch("/.netlify/functions/airtable")
      .then((response) => response.json())
      .then((data) => setProjects(data.records));
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img alt="logo" src="logo.png" className="logo" />
      </header>
      {projects.map((project) => {
        return <ProjectCard data={project.fields} />;
      })}
    </div>
  );
}

export default App;
