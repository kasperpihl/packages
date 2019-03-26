import { useState, useEffect, useRef } from 'react';
import { fromJS } from 'immutable';
import ProjectStateManager from 'core/classes/ProjectStateManager';
import useUpdate from 'core/react/_hooks/useUpdate';
import request from 'core/utils/request';

export default function useSyncedProject(projectId, localState, callback) {
  const unmountedRef = useRef();
  const [stateManager, setStateManager] = useState();

  useEffect(() => {
    request('project.get', {
      project_id: projectId
    }).then(res => {
      if (res.ok) {
        !unmountedRef.current &&
          setStateManager(
            new ProjectStateManager(fromJS(res.project), localState)
          );
        callback && callback(null, res.project);
      } else {
        callback && callback(res.error);
      }
    });
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  useUpdate('project', project => {
    if (project.project_id === projectId && stateManager) {
      stateManager.syncHandler.mergeChange(project);
    }
  });

  return stateManager;
}
