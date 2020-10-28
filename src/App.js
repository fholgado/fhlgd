import React, { useEffect, useState } from "react";
import { Router, Link } from "@reach/router";
import "./App.css";

function formatDate(dateString, withTime) {
  const dateData = new Date(dateString);
  const dateFormat = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  if (withTime) {
    dateFormat.hour = "2-digit";
    dateFormat.minute = "2-digit";
  }
  return `${dateData.toLocaleString("default", dateFormat)} `;
}

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
        ) : data["In Progress Photos"] ? (
          <img
            alt="Project"
            src={
              data["In Progress Photos"][data["In Progress Photos"].length - 1]
                .thumbnails.large.url
            }
          />
        ) : null}
      </div>
      <div className="project-meta">
        <h3>
          <Link to={`/project/${project.id}`}>
            {data.Name}{" "}
            {data["Date Completed"]
              ? `(${formatDate(data["Date started"])})`
              : "(In Progress)"}
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
    <div className="project-year-container">
      <h2>{projectYear}</h2>
      {projectsByYear[projectYear].map((project) => {
        return <ProjectCard key={project.id} project={project} />;
      })}
    </div>
  );
}

function ProjectWorkLog({ data }) {
  return (
    <div className="project-work-log">
      <p>
        <strong>Date:</strong> {formatDate(data.Date, true)}
      </p>
      <p>
        <strong>Description:</strong> {data.Description}
      </p>
      {data["Attachments"].map((workLogPhoto) => {
        return (
          <img alt="project" key={workLogPhoto.id} src={workLogPhoto.url} />
        );
      })}
    </div>
  );
}

function Project({ projects, projectId, workLogs }) {
  if (!projects.length) return "Loading...";
  const project = projects.find((projectToFilter) => {
    return projectToFilter.id === projectId;
  });
  const projectWorkLogs = workLogs.filter((workLog) => {
    return (
      workLog.fields["Table 1"] && workLog.fields["Table 1"][0] === projectId
    );
  });

  const data = project.fields;
  return (
    <div className="project-page">
      <h2>{data.Name}</h2>
      <p className="date">
        <strong>Started</strong> {formatDate(data["Date started"])}
        {data["Date Completed"] && (
          <React.Fragment>
            , <strong>Completed</strong> {formatDate(data["Date Completed"])}
          </React.Fragment>
        )}
      </p>
      <div className="project-page-container">
        <div className="project-images">
          {data["Finished Photos"] && (
            <React.Fragment>
              <h3>Finished Photos</h3>
              {data["Finished Photos"].map((finishedPhoto) => {
                return (
                  <img
                    alt="project"
                    key={finishedPhoto.id}
                    src={finishedPhoto.url}
                  />
                );
              })}
            </React.Fragment>
          )}
          <h3>Work log</h3>
          {projectWorkLogs.map((data) => {
            return <ProjectWorkLog key={data.id} data={data.fields} />;
          })}
          {data["In Progress Photos"] && (
            <React.Fragment>
              <h3>Progress Photos</h3>
              {data["In Progress Photos"].map((progressPhoto) => {
                return (
                  <img
                    alt="project"
                    key={progressPhoto.id}
                    src={progressPhoto.url}
                  />
                );
              })}
            </React.Fragment>
          )}
        </div>
        <div className="project-meta">
          <h3>Details</h3>
          <p>{data.Description}</p>
          <p>
            <strong>Materials:</strong> {data["Wood Species"].join(", ")}
          </p>
          {data["Features"] && (
            <p>
              <strong>Features and joinery:</strong>{" "}
              {data["Features"].join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [projects, setProjects] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [projectsByYear, setProjectsByYear] = useState([]);
  useEffect(() => {
    fetch("/.netlify/functions/get-data?type=all_projects")
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
    fetch("/.netlify/functions/get-data?type=all_work_logs")
      .then((response) => response.json())
      .then((data) => {
        setWorkLogs(data.records);
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
          <Project
            path="/project/:projectId"
            projects={projects}
            workLogs={workLogs}
          />
        </Router>
      </main>
    </div>
  );
}

export default App;
