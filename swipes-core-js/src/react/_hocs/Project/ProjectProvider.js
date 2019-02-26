import React, { createContext } from 'react';

export const ProjectContext = createContext({});

export default function ProjectProvider({ stateManager, children }) {
  return (
    <ProjectContext.Provider value={stateManager}>
      {children}
    </ProjectContext.Provider>
  );
}
