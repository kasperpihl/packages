export default function(endpoint, params) {
  const serData = {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(params || {}),
  };
  return new Promise((resolve, reject) => {
    fetch(`${location.origin}/v1/${endpoint}`, serData).then((r) => {
      if (r && r.ok) return r.json();
      resolve(null, { message: r.statusText, code: r.status });
    }).then((res) => {
      resolve(res);
    }).catch((e) => {
      resolve(null, e);
    });
  })
}