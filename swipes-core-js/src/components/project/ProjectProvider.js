import React from 'react';
import ProjectContext from './ProjectContext';

export default function ProjectProvider({ stateManager, children }) {
  return (
    <ProjectContext.Provider value={stateManager}>
      {children}
    </ProjectContext.Provider>
  );
}
