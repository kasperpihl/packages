import * as a from './';

const sendFile = (presignedURL, file, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback({ ok: true });
      } else {
        callback({ ok: false });
      }
    }
  };
  xhr.open('PUT', presignedURL);
  xhr.setRequestHeader('Content-Type', file.type);
  xhr.send(file);
};

export const uploadToS3 = files => (d, getState) => new Promise((resolve) => {
  const file = files[0];
  const fileName = file.name;
  const orgId = getState().me.getIn(['organizations', 0, 'id']);
  let s3Url = '';
  d(a.api.request('files.signedUrl', {
    organization_id: orgId,
    file_name: fileName,
    file_type: file.type,
  })).then((res) => {
    if (!res.ok) {
      resolve({ ok: false });
    }
    const signedUrl = res.signed_url;
    s3Url = res.s3_url;
    sendFile(signedUrl, file, (fileRes) => {
      if (fileRes && fileRes.ok) {
        resolve({ ok: true, s3Url });
      } else {
        resolve({ ok: false });
      }
    });
  });
});

export const create = files => (d, getState) => new Promise((resolve) => {
  // First do S3 upload
  const file = files[0];
  const fileName = file.name;
  const orgId = getState().me.getIn(['organizations', 0, 'id']);

  d(uploadToS3(files)).then((s3res) => {
    if (!s3res.ok) {
      return resolve(s3res);
    }
    return d(a.api.request('files.create', {
      organization_id: orgId,
      file_name: fileName,
      s3_url: s3res.s3Url,
    }));
  }).then((localRes) => {
    resolve(localRes);
  });
});
