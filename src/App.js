import React, { useEffect, useState } from "react";
import { Router, Link } from "@reach/router";
import { COLUMNS, TABLES } from "./data";
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
        {data[COLUMNS.PROJECTS.FINISHED_PHOTOS] ? (
          <img
            alt="project"
            src={data[COLUMNS.PROJECTS.FINISHED_PHOTOS][0].thumbnails.large.url}
          />
        ) : data[COLUMNS.PROJECTS.PROGRESS_PHOTOS] ? (
          <img
            alt="Project"
            src={
              data[COLUMNS.PROJECTS.PROGRESS_PHOTOS][
                data[COLUMNS.PROJECTS.PROGRESS_PHOTOS].length - 1
              ].thumbnails.large.url
            }
          />
        ) : null}
      </div>
      <div className="project-meta">
        <h3>
          <Link to={`/project/${project.id}`}>
            {data.Name}{" "}
            {data[COLUMNS.PROJECTS.DATE_COMPLETED]
              ? `(${formatDate(data[COLUMNS.PROJECTS.DATE_STARTED])})`
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
      {data[COLUMNS.WORK_LOGS.ATTACHMENTS].map((workLogPhoto) => {
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
        <strong>Started</strong>{" "}
        {formatDate(data[COLUMNS.PROJECTS.DATE_STARTED])}
        {data[COLUMNS.PROJECTS.DATE_COMPLETED] && (
          <React.Fragment>
            , <strong>Completed</strong>{" "}
            {formatDate(data[COLUMNS.PROJECTS.DATE_COMPLETED])}
          </React.Fragment>
        )}
      </p>
      <div className="project-page-container">
        <div className="project-images">
          {data[COLUMNS.PROJECTS.FINISHED_PHOTOS] && (
            <React.Fragment>
              <h3>Finished Photos</h3>
              {data[COLUMNS.PROJECTS.FINISHED_PHOTOS].map((finishedPhoto) => {
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
          {data[COLUMNS.PROJECTS.PROGRESS_PHOTOS] && (
            <React.Fragment>
              <h3>Progress Photos</h3>
              {data[COLUMNS.PROJECTS.PROGRESS_PHOTOS].map((progressPhoto) => {
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
          <p>{data[COLUMNS.WORK_LOGS.DESCRIPTION]}</p>
          <p>
            <strong>Materials:</strong>{" "}
            {data[COLUMNS.PROJECTS.MATERIALS].join(", ")}
          </p>
          {data[COLUMNS.PROJECTS.FEATURES] && (
            <p>
              <strong>Features and joinery:</strong>{" "}
              {data[COLUMNS.PROJECTS.FEATURES].join(", ")}
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
          const projectYear = project.fields[COLUMNS.PROJECTS.DATE_STARTED]
            ? new Date(project.fields[COLUMNS.PROJECTS.DATE_STARTED]).getFullYear()
            : project.fields[COLUMNS.PROJECTS.DATE_COMPLETED]
            ? new Date(project.fields[COLUMNS.PROJECTS.DATE_COMPLETED]).getFullYear()
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
