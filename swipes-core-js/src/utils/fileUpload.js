import request from './request';

const uploadFileToS3 = (presignedURL, file) =>
  new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        resolve({ ok: xhr.status === 200 });
      }
    };
    xhr.open('PUT', presignedURL);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });

export default async (files, ownedBy) => {
  // First do S3 upload
  const file = files[0];
  const fileName = file.name;

  let res = await request('file.getSignedUrl', {
    owned_by: ownedBy,
    file_name: fileName,
    file_type: file.type
  });

  if (!res.ok) {
    return res;
  }

  const signedUrl = res.signed_url;
  let s3Url = res.s3_url;

  res = await uploadFileToS3(signedUrl, file);

  if (!res.ok) {
    return res;
  }

  return await request('file.add', {
    owned_by: ownedBy,
    file_name: fileName,
    s3_url: s3Url
  });
};
