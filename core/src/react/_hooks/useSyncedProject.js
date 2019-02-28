import { useState, useEffect, useRef } from 'react';
import { fromJS } from 'immutable';
import ProjectStateManager from 'core/classes/ProjectStateManager';
import useUpdate from 'core/react/_hooks/useUpdate';
import request from 'core/utils/request';

export default function useSyncedProject(projectId) {
  const unmountedRef = useRef();
  const [stateManager, setStateManager] = useState();

  useEffect(() => {
    request('project.get', {
      project_id: projectId
    }).then(res => {
      if (res.ok) {
        !unmountedRef.current &&
          setStateManager(new ProjectStateManager(fromJS(res.project)));
      } else {
        throw Error('Could not load project');
      }
    });
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  useUpdate('project', project => {
    if (project.project_id === projectId) {
      stateManager.syncHandler.mergeChange(project);
    }
  });

  return stateManager;
}
