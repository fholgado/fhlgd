import React, { useEffect, useState } from "react";
import { Router, Link } from "@reach/router";
import "./App.css";

function Nav({ projectsByYear }) {
  return (
    <React.Fragment>
      <header className="App-header">
        <a href="/" alt="fholgado">
          <img alt="logo" src="/logo.png" className="logo" />
        </a>
      </header>
      <nav>
        {Object.keys(projectsByYear).map((projectYear) => {
          return (
            <Link key={projectYear} to={`/year/${projectYear}`}>
              {projectYear}
            </Link>
          );
        })}
      </nav>
    </React.Fragment>
  );
}

function ProjectCard({ project }) {
  const data = project.fields;
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
          <Link to={`/project/${project.id}`}>
            {data.Name} ({data["Date started"]})
          </Link>
        </h3>
        <p>{data.Description}</p>
      </div>
    </div>
  );
}

function Home({ projects }) {
  return (
    <div>
      <h2>Favorite Projects</h2>
      {projects
        .filter((project) => project.fields["Favorite"])
        .map((project) => {
          return <ProjectCard key={project.id} project={project} />;
        })}
    </div>
  );
}

function ProjectsByYear({ projectsByYear, projectYear }) {
  if (!projectsByYear[projectYear]) return "Loading...";
  return (
    <div class="project-year-container">
      <h2>{projectYear}</h2>
      {projectsByYear[projectYear].map((project) => {
        return <ProjectCard key={project.id} project={project} />;
      })}
    </div>
  );
}

function Project({ projects, projectId }) {
  if (!projects.length) return "Loading...";
  const project = projects.find((projectToFilter) => {
    return projectToFilter.id === projectId;
  });
  const data = project.fields;
  return (
    <div className="project-page">
      <div className="project-images">
        {data["Finished Photos"] &&
          data["Finished Photos"].map((finishedPhoto) => {
            return (
              <img
                alt="project"
                key={finishedPhoto.id}
                src={
                  finishedPhoto.thumbnails
                    ? finishedPhoto.thumbnails.large.url
                    : finishedPhoto.url
                }
              />
            );
          })}
        {data["In Progress Photos"] &&
          data["In Progress Photos"].map((progressPhoto) => {
            return (
              <img
                alt="project"
                key={progressPhoto.id}
                src={
                  progressPhoto.thumbnails
                    ? progressPhoto.thumbnails.large.url
                    : progressPhoto.url
                }
              />
            );
          })}
      </div>
      <div className="project-meta">
        <h3>
          <Link to={`/project/${project.id}`}>
            {data.Name} ({data["Date started"]})
          </Link>
        </h3>
        <p>{data.Description}</p>
      </div>
    </div>
  );
}

function App() {
  const [projects, setProjects] = useState([]);
  const [projectsByYear, setProjectsByYear] = useState([]);
  useEffect(() => {
    fetch("/.netlify/functions/get-projects")
      .then((response) => response.json())
      .then((data) => {
        setProjects(data.records);
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
      <Nav projectsByYear={projectsByYear} />
      <main>
        <Router>
          <Home path="/" projects={projects} />
          <ProjectsByYear
            path="/year/:projectYear"
            projectsByYear={projectsByYear}
          />
          <Project path="/project/:projectId" projects={projects} />
        </Router>
      </main>
    </div>
  );
}

export default App;
