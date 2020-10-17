import React, { useEffect, useState } from "react";
import "./App.css";

function ProjectCard({ data }) {
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
  const [projectsByYear, setProjectsByYear] = useState([]);
  useEffect(() => {
    fetch("/.netlify/functions/get-projects")
      .then((response) => response.json())
      .then((data) => {
        // Sort Projects by year
        const projectsByYear = { unknown: [] };
        data.records.forEach((project) => {
          const projectYear = project.fields["Date started"]
            ? new Date(project.fields["Date started"]).getFullYear()
            : project.fields["Date Completed"]
            ? new Date(project.fields["Date Completed"]).getFullYear()
            : null;
          if (projectYear === null) {
            projectsByYear.unknown.push(project);
          } else {
            if (!projectsByYear[projectYear]) {
              projectsByYear[projectYear] = [];
            }
            projectsByYear[projectYear].push(project);
          }
        });
        setProjectsByYear(projectsByYear);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img alt="logo" src="logo.png" className="logo" />
      </header>
      {Object.keys(projectsByYear).map((projectYear) => {
        return (
          <div class="project-year-container">
            <h2>{projectYear}</h2>
            {projectsByYear[projectYear].map((project) => {
              return <ProjectCard data={project.fields} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default App;
