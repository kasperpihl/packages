import { useState, useEffect } from 'react';
import { fromJS } from 'immutable';
import ProjectStateManager from 'core/classes/ProjectStateManager';
import useUpdate from 'core/react/_hooks/useUpdate';
import useUnmountedRef from 'src/react/_hooks/useUnmountedRef';
import request from 'core/utils/request';

export default function useSyncedProject(projectId) {
  const unmountedRef = useUnmountedRef();
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
  }, []);

  useUpdate('project', project => {
    if (project.project_id === projectId) {
      stateManager.syncHandler.mergeChange(project);
    }
  });

  return stateManager;
}
