import { useState, useEffect, useRef } from 'react';
import request from 'src/utils/request';
import useConnected from 'src/react/_hooks/useConnected';

export default function useRequest(endpoint, params, callback) {
  const [reqId, setReqId] = useState(1);
  const connected = useConnected();

  const defaultState = { loading: true, retry, merge };
  const [req, setReq] = useState(defaultState);

  function merge(key, data) {
    setReq(r => {
      if (!r.result) return r;

      const newR = { ...r };
      let result = newR.result;
      if (typeof data === 'function') {
        result[key] = data(result[key]);
      } else {
        result[key] = {
          ...result[key],
          ...data
        };
      }
      newR.result = result;
      return newR;
    });
  }

  function retry(reset) {
    if (reset) {
      setReq(defaultState);
    } else {
      setReq(r => ({ ...r, retrying: true }));
    }
    setReqId(count => count + 1);
  }

  useEffect(() => {
    console.log(req.result, connected);
    if (req.result && connected) retry();
  }, [connected]);

  const uniqueResRef = useRef(null);

  useEffect(() => {
    uniqueResRef.current = reqId;
    request(endpoint, params).then(res => {
      if (uniqueResRef.current !== reqId) {
        // Retry was called, or component was unmounted
        return;
      }
      if (res.ok) {
        setReq({ result: res, retry, merge });
        if (typeof callback === 'function') {
          callback(res);
        }
      } else {
        setReq({ error: res.error, retry, merge });
      }
    });
    return () => {
      uniqueResRef.current = null;
    };
  }, [reqId]);

  return req;
}
