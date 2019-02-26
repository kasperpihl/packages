import { useState, useEffect, useRef } from 'react';
import request from 'src/utils/request';

export default function useRequest(endpoint, params, callback) {
  const [reqId, setReqId] = useState(1);

  const defaultState = { loading: true, retry, merge };
  const [req, setReq] = useState(defaultState);

  function merge(key, data) {
    setReq(r => {
      if (!r.result) return r;

      const newR = { ...r };
      const result = newR.result;
      if (typeof data === 'function') {
        result = data(result);
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
